package com.urechki.order_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    private Long customerId;
    private Long productId;
    private Integer quantity;
    private String promoCode;
    private BigDecimal bonusSpent;
    private String paymentMethod;
}
