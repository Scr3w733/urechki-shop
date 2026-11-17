package com.urechki.order_service.dto;

import lombok.Data;

@Data
public class CustomerDto {
    private Long id;
    private String name;
    private String email;
    private Integer discountPercent;
    private Integer bonusPoints;
    private String role;
}
