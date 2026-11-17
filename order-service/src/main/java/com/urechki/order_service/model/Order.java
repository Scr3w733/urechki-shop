package com.urechki.order_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long productId;
    private Integer quantity;

    private BigDecimal basePrice;
    private BigDecimal finalPrice;

    private String status = "Оплачен";
    private String paymentMethod = "Банковская карта";
    private String transactionId;
    private String promoCode;
    private BigDecimal bonusSpent = BigDecimal.ZERO;

    private LocalDateTime createdAt = LocalDateTime.now();
}
