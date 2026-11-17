package com.urechki.analytics_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "analytics_events", indexes = {
        @Index(name = "idx_analytics_events_type", columnList = "type"),
        @Index(name = "idx_analytics_events_created_at", columnList = "created_at")
})
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Тип события: view_product, add_to_cart, checkout_start, order_created и др. */
    private String type;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "product_id")
    private Long productId;

    private BigDecimal amount;

    /** Исходный JSON запроса целиком — для отладки и будущих разборов. */
    @Column(name = "payload", columnDefinition = "text")
    private String payload;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
