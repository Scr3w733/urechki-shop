package com.urechki.order_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId; // ID клиента из CRM
    private Long productId;  // ID товара из Каталога
    private Integer quantity;
    private BigDecimal finalPrice; // Итоговая цена со скидкой
}