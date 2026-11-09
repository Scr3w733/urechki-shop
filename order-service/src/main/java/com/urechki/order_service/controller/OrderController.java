package com.urechki.order_service.controller;

import com.urechki.order_service.model.Order;
import com.urechki.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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
    public Order createOrder(@RequestBody Order order) {
        // 1. Идем в каталог за товаром (порт 8080)
        Map<String, Object> product = restTemplate.getForObject("http://localhost:8080/api/products/" + order.getProductId(), Map.class);
        
        // 2. Идем в CRM за клиентом (порт 8081)
        Map<String, Object> customer = restTemplate.getForObject("http://localhost:8081/api/customers/" + order.getCustomerId(), Map.class);

        // 3. Считаем цену
        BigDecimal price = new BigDecimal(product.get("price").toString());
        int discount = (int) customer.get("discountPercent");
        
        BigDecimal total = price.multiply(new BigDecimal(order.getQuantity()));
        BigDecimal discountAmount = total.multiply(new BigDecimal(discount).divide(new BigDecimal(100)));
        
        order.setFinalPrice(total.subtract(discountAmount));

        return orderRepository.save(order);
    }
}