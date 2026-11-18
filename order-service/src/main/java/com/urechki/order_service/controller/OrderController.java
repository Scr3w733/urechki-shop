package com.urechki.order_service.controller;

import com.urechki.order_service.dto.CustomerDto;
import com.urechki.order_service.dto.OrderRequest;
import com.urechki.order_service.dto.PaymentResponse;
import com.urechki.order_service.dto.ProductDto;
import com.urechki.order_service.model.Order;
import com.urechki.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${app.services.catalog:http://catalog-service:8080}")
    private String catalogUrl;
    @Value("${app.services.crm:http://crm-service:8081}")
    private String crmUrl;
    @Value("${app.services.payment:http://payment-service:8085}")
    private String paymentUrl;
    @Value("${app.services.notification:http://notification-service:8084}")
    private String notificationUrl;

    /** Единая проверка жизни сервиса для страницы состояния платформы. */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "order-service", "orders", orderRepository.count());
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Заказ не найден"));
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(@PathVariable Long customerId) {
        return orderRepository.findAll().stream()
                .filter(o -> customerId.equals(o.getCustomerId()))
                .toList();
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = getOrderById(id);
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Укажите status");
        }
        order.setStatus(status.trim());
        return orderRepository.save(order);
    }

    @PostMapping
    @Transactional
    public Order createOrder(@RequestBody OrderRequest request) {
        if (request.getCustomerId() == null || request.getProductId() == null) {
            throw new IllegalArgumentException("Укажите клиента и товар");
        }
        Integer quantity = request.getQuantity();
        if (quantity == null || quantity < 1 || quantity > 100) {
            throw new IllegalArgumentException("Количество должно быть от 1 до 100");
        }

        ProductDto product = fetch(catalogUrl + "/api/products/" + request.getProductId(), ProductDto.class, "Товар не найден");
        CustomerDto customer = fetch(crmUrl + "/api/customers/" + request.getCustomerId(), CustomerDto.class, "Клиент не найден");

        int available = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        if (available < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недостаточно товара на складе");
        }

        // --- Цена полностью считается сервером: клиент не может прислать свою ---
        BigDecimal price = product.getPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "У товара некорректная цена");
        }
        int discountPercent = customer.getDiscountPercent() == null ? 0 : Math.max(0, Math.min(100, customer.getDiscountPercent()));
        BigDecimal basePrice = price.multiply(BigDecimal.valueOf(quantity));
        BigDecimal afterDiscount = basePrice.subtract(basePrice.multiply(BigDecimal.valueOf(discountPercent)).divide(HUNDRED, 2, RoundingMode.HALF_UP));

        BigDecimal promoDiscount = calculatePromoDiscount(request.getPromoCode(), afterDiscount);
        BigDecimal remaining = afterDiscount.subtract(promoDiscount).max(BigDecimal.ZERO);

        BigDecimal maxBonus = BigDecimal.valueOf(customer.getBonusPoints() == null ? 0 : customer.getBonusPoints()).min(remaining);
        BigDecimal bonusSpent = request.getBonusSpent() == null ? BigDecimal.ZERO : request.getBonusSpent();
        if (bonusSpent.signum() < 0) bonusSpent = BigDecimal.ZERO;
        bonusSpent = bonusSpent.setScale(0, RoundingMode.DOWN).min(maxBonus);

        BigDecimal finalPrice = remaining.subtract(bonusSpent).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        // Резервируем остаток до оплаты.
        changeStock(request.getProductId(), -quantity);

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setProductId(request.getProductId());
        order.setQuantity(quantity);
        order.setBasePrice(basePrice.setScale(2, RoundingMode.HALF_UP));
        order.setFinalPrice(finalPrice);
        order.setStatus("Ожидает оплаты");
        order.setPaymentMethod(request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()
                ? "Банковская карта" : request.getPaymentMethod());
        order.setPromoCode(request.getPromoCode());
        order.setBonusSpent(bonusSpent);
        order = orderRepository.save(order);

        try {
            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("amount", finalPrice);
            paymentRequest.put("method", order.getPaymentMethod());
            paymentRequest.put("idempotencyKey", "order-" + order.getId());

            PaymentResponse payment = restTemplate.postForObject(
                    paymentUrl + "/api/payments/process", paymentRequest, PaymentResponse.class);
            if (payment == null || !"SUCCESS".equals(payment.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        payment == null ? "Платёж не прошёл" : payment.getMessage());
            }
            order.setTransactionId(payment.getTransactionId());
            order.setStatus("Оплачен");
            order = orderRepository.save(order);
        } catch (Exception ex) {
            // Возвращаем товар и помечаем заказ отменённым — деньги не должны «зависнуть».
            try { changeStock(request.getProductId(), quantity); } catch (Exception ignore) { log.warn("Не удалось вернуть остаток товара #{}", request.getProductId()); }
            order.setStatus("Отменён");
            orderRepository.save(order);
            if (ex instanceof ResponseStatusException rse) throw rse;
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Платёжный сервис недоступен");
        }

        if (bonusSpent.signum() > 0) {
            try {
                Map<String, Integer> bonusBody = Map.of("delta", -bonusSpent.intValue());
                restTemplate.postForObject(crmUrl + "/api/customers/" + request.getCustomerId() + "/bonuses", bonusBody, Object.class);
            } catch (Exception ex) {
                log.warn("Не удалось списать бонусы клиента #{}: {}", request.getCustomerId(), ex.getMessage());
            }
        }

        try {
            Map<String, String> notification = new HashMap<>();
            notification.put("email", customer.getEmail() == null ? "" : customer.getEmail());
            notification.put("message", "Заказ №" + order.getId() + " на сумму " + finalPrice + " руб. оформлен!");
            restTemplate.postForObject(notificationUrl + "/api/notifications/send", notification, String.class);
        } catch (Exception ex) {
            log.warn("Уведомление не отправлено: {}", ex.getMessage());
        }

        log.info("Заказ #{} оформлен на {}", order.getId(), finalPrice);
        return order;
    }

    private <T> T fetch(String url, Class<T> type, String notFoundMessage) {
        try {
            T result = restTemplate.getForObject(url, type);
            if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMessage);
            return result;
        } catch (RestClientException ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("404")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMessage);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Сервис данных недоступен");
        }
    }

    private void changeStock(Long productId, int delta) {
        try {
            restTemplate.patchForObject(catalogUrl + "/api/products/" + productId + "/stock",
                    Map.of("quantity", delta), ProductDto.class);
        } catch (RestClientException ex) {
            log.warn("Не удалось изменить остаток товара #{}: {}", productId, ex.getMessage());
            if (ex.getMessage() != null && ex.getMessage().contains("400")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недостаточно товара на складе");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Каталог недоступен");
        }
    }

    private BigDecimal calculatePromoDiscount(String promoCode, BigDecimal amount) {
        if (promoCode == null || promoCode.isBlank()) return BigDecimal.ZERO;
        return switch (promoCode.trim().toUpperCase()) {
            // URE4KA — основной промокод сайта (плашка на главной), раньше сервер его игнорировал.
            case "URE4KA", "BEER5" -> amount.multiply(new BigDecimal("0.05"));
            case "BEER10" -> amount.multiply(new BigDecimal("0.10"));
            case "BEER15" -> amount.multiply(new BigDecimal("0.15"));
            case "CASH500" -> amount.min(BigDecimal.valueOf(500));
            default -> BigDecimal.ZERO;
        };
    }
}
