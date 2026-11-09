package com.urechki.crm_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private Integer discountPercent; // Скидка постоянного клиента (например, 10%)
}