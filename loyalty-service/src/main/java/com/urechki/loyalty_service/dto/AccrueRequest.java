package com.urechki.loyalty_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccrueRequest {
    private Long customerId;
    private Long orderId;
    private BigDecimal amount;
}
