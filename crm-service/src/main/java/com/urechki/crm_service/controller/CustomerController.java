package com.urechki.crm_service.controller;

import com.urechki.crm_service.dto.CustomerResponse;
import com.urechki.crm_service.model.Customer;
import com.urechki.crm_service.repository.CustomerRepository;
import com.urechki.crm_service.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;

    @Value("${app.admin.email:admin@urechki.ru}")
    private String adminEmail;

    private static final int PROMO_SPINS_PER_DAY = 3;
    // Только коды, которые реально понимает order-service.
    private static final String[] PROMO_PRIZES = {
            "Скидка 5%", "Скидка 10%", "Скидка 15%", "Промокод 500р", "Скидка для своих", "Лёгкая скидка"
    };
    private static final String[] PROMO_CODES = {
            "BEER5", "BEER10", "BEER15", "CASH500", "URE4KA", "BEER5"
    };
    private final ConcurrentMap<String, AtomicInteger> promoSpins = new ConcurrentHashMap<>();

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(CustomerResponse::from).toList();
    }

    /** Единая проверка жизни сервиса для страницы состояния платформы. */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "crm-service", "customers", customerRepository.count());
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomerById(@PathVariable Long id) {
        return fromOrThrow(id);
    }

    private CustomerResponse fromOrThrow(Long id) {
        return CustomerResponse.from(customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Клиент не найден")));
    }

    @PostMapping("/register")
    @Transactional
    public CustomerResponse register(@RequestBody Customer customer) {
        String email = normalizeEmail(customer.getEmail());
        String name = customer.getName() == null ? "" : customer.getName().trim();
        String password = customer.getPassword();

        if (email == null) throw new IllegalArgumentException("Укажите корректный email");
        if (name.isEmpty()) throw new IllegalArgumentException("Укажите имя");
        if (password == null || password.length() < 4) {
            throw new IllegalArgumentException("Пароль должен быть не короче 4 символов");
        }
        if (customerRepository.findByEmail(email) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Этот email уже занят");
        }

        // Роль и скидку определяет сервер, а не клиент.
        Customer saved = new Customer();
        saved.setName(name);
        saved.setEmail(email);
        saved.setPhone(customer.getPhone() == null || customer.getPhone().isBlank() ? "" : customer.getPhone().trim());
        saved.setPassword(PasswordUtil.hash(password));
        saved.setBonusPoints(0);
        if (email.equalsIgnoreCase(adminEmail)) {
            saved.setRole("Владелец");
            saved.setDiscountPercent(10);
        } else {
            saved.setRole("Клиент");
            saved.setDiscountPercent(5);
        }
        return CustomerResponse.from(customerRepository.save(saved));
    }

    @PostMapping("/login")
    @Transactional
    public CustomerResponse login(@RequestBody Map<String, String> credentials) {
        String email = normalizeEmail(credentials.get("email"));
        String password = credentials.get("password");
        Customer customer = email == null ? null : customerRepository.findByEmail(email);

        if (customer == null || password == null || !PasswordUtil.matches(password, customer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль");
        }
        if (PasswordUtil.needsUpgrade(customer.getPassword())) {
            customer.setPassword(PasswordUtil.hash(password));
            customer = customerRepository.save(customer);
        }
        return CustomerResponse.from(customer);
    }

    /** Обновление профиля: запрещаем менять роль, скидку и email. */
    @PutMapping("/{id}")
    @Transactional
    public CustomerResponse updateProfile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Клиент не найден"));
        if (body.get("name") != null && !body.get("name").isBlank()) customer.setName(body.get("name").trim());
        if (body.get("phone") != null) customer.setPhone(body.get("phone").trim());
        if (body.get("password") != null && !body.get("password").isBlank()) {
            String password = body.get("password");
            if (password.length() < 4) throw new IllegalArgumentException("Пароль должен быть не короче 4 символов");
            customer.setPassword(PasswordUtil.hash(password));
        }
        return CustomerResponse.from(customerRepository.save(customer));
    }

    /** Изменение бонусного баланса (положительное значение — начисление). */
    @PostMapping("/{id}/bonuses")
    @Transactional
    public CustomerResponse changeBonuses(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Клиент не найден"));
        Integer delta = body.get("delta");
        if (delta == null) throw new IllegalArgumentException("Укажите delta");
        int current = customer.getBonusPoints() == null ? 0 : customer.getBonusPoints();
        int next = current + delta;
        if (next < 0) throw new IllegalArgumentException("Недостаточно бонусов");
        customer.setBonusPoints(next);
        return CustomerResponse.from(customerRepository.save(customer));
    }

    /**
     * Предпросмотр следующего приза без списания попытки.
     */
    @GetMapping("/promo")
    public Map<String, Object> getPromo(@RequestParam(required = false) String email) {
        String normalized = normalizeEmail(email);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите email клиента");
        }
        int used = spinsUsed(normalized, false);
        return prizeResponse(normalized, used + 1, used, false);
    }

    /**
     * Одно вращение: сервер сам определяет приз и списывает одну из 3 попыток в день.
     */
    @PostMapping("/promo/claim")
    public Map<String, Object> claimPromo(@RequestBody(required = false) Map<String, String> body) {
        String normalized = normalizeEmail(body == null ? null : body.get("email"));
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите email клиента");
        }
        int used = spinsUsed(normalized, true);
        if (used >= PROMO_SPINS_PER_DAY) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Лимит попыток на сегодня исчерпан. Возвращайтесь завтра.");
        }
        int attempt = used + 1;
        return prizeResponse(normalized, attempt, attempt, true);
    }

    private int spinsUsed(String email, boolean cleanup) {
        String today = LocalDate.now().toString();
        if (cleanup) {
            // Старые ключи больше не нужны — не даём карте расти бесконечно.
            promoSpins.keySet().removeIf(key -> !key.endsWith("|" + today));
        }
        String key = email + "|" + today;
        return promoSpins.computeIfAbsent(key, ignored -> new AtomicInteger()).get();
    }

    private Map<String, Object> prizeResponse(String email, int attempt, int used, boolean consume) {
        String today = LocalDate.now().toString();
        int index = Math.abs((email + "|" + today + "|" + attempt).hashCode()) % PROMO_PRIZES.length;
        if (consume) {
            promoSpins.computeIfAbsent(email + "|" + today, ignored -> new AtomicInteger()).incrementAndGet();
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("prizeIndex", index);
        response.put("prize", PROMO_PRIZES[index]);
        response.put("promoCode", PROMO_CODES[index]);
        response.put("spinsUsed", used);
        response.put("spinsLimit", PROMO_SPINS_PER_DAY);
        response.put("spinsLeft", Math.max(0, PROMO_SPINS_PER_DAY - used));
        return response;
    }

    private String normalizeEmail(String email) {
        if (email == null) return null;
        String value = email.trim().toLowerCase(Locale.ROOT);
        return value.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$") ? value : null;
    }

}
