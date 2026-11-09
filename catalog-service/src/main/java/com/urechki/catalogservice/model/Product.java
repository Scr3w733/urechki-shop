package com.urechki.catalogservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Пиво "Жигулевское", сухарики и т.д.
    private String category; // "Пиво", "Закуски", "Мерч"
    private BigDecimal price;
    private Integer stockQuantity; // Учет товара на складе
    private String description;
}