package com.urechki.crm_service.controller;

import com.urechki.crm_service.model.Customer;
import com.urechki.crm_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {
    private final CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id).orElseThrow();
    }

    // РЕГИСТРАЦИЯ
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {
        if (customerRepository.findByEmail(customer.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Этот email уже занят"));
        }
        if (customer.getRole() == null) customer.setRole("Клиент");
        if (customer.getDiscountPercent() == null) customer.setDiscountPercent(5);
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    // ВХОД
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        Customer customer = customerRepository.findByEmail(credentials.get("email"));
        if (customer != null && customer.getPassword().equals(credentials.get("password"))) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Неверный email или пароль"));
    }

    // Генерация промокода для рулетки
    @GetMapping("/promo")
    public java.util.Map<String, Object> getPromo() {
        String[] prizes = {"Скидка 5%", "Бесплатная доставка", "Скидка 10%", "Бокал в подарок", "Скидка 15%", "Промокод 500р"};
        String[] promoCodes = {"BEER5", "FREEDEL", "BEER10", "GLASS", "BEER15", "CASH500"};
        
        int randomIndex = (int) (Math.random() * prizes.length);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("prizeIndex", randomIndex); 
        response.put("prize", prizes[randomIndex]);
        response.put("promoCode", promoCodes[randomIndex]);
        
        return response;
    }
}