package com.urechki.order_service.controller;

import com.urechki.order_service.model.Order;
import com.urechki.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            // 1. Проверяем товар
            Map<String, Object> product = restTemplate.getForObject("http://catalog-service:8080/api/products/" + order.getProductId(), Map.class);
            if (product == null) throw new RuntimeException("Товар не найден!");

            // 2. Проверяем клиента
            Map<String, Object> customer = restTemplate.getForObject("http://crm-service:8081/api/customers/" + order.getCustomerId(), Map.class);
            if (customer == null) throw new RuntimeException("Клиент не найден!");

            // Если фронтенд прислал финальную цену (со скидками и бонусами), используем её
            if (order.getFinalPrice() == null) {
                BigDecimal price = new BigDecimal(product.get("price").toString());
                int discount = (int) customer.get("discountPercent");
                BigDecimal total = price.multiply(new BigDecimal(order.getQuantity()));
                BigDecimal discountAmount = total.multiply(new BigDecimal(discount).divide(new BigDecimal(100)));
                order.setFinalPrice(total.subtract(discountAmount));
            }

            // 3. Оплата
            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("amount", order.getFinalPrice());
            paymentRequest.put("method", "Банковская карта");
            
            Map<String, Object> paymentResponse = restTemplate.postForObject("http://payment-service:8085/api/payments/process", paymentRequest, Map.class);
            String status = (String) paymentResponse.get("status");

            if (!"SUCCESS".equals(status)) throw new RuntimeException("Банк отклонил платеж!");

            // 4. Сохранение и уведомление
            Order savedOrder = orderRepository.save(order);

            try {
                Map<String, String> notification = new HashMap<>();
                notification.put("email", "client@example.com");
                notification.put("message", "Заказ №" + savedOrder.getId() + " на сумму " + savedOrder.getFinalPrice() + " руб. оформлен!");
                restTemplate.postForObject("http://notification-service:8084/api/notifications/send", notification, String.class);
            } catch (Exception e) {
                System.out.println("Уведомление не отправлено: " + e.getMessage());
            }

            return ResponseEntity.ok(savedOrder);

        } catch (Exception e) {
            System.out.println("ОШИБКА: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}