package com.urechki.catalogservice.controller;

import com.urechki.catalogservice.model.Product;
import com.urechki.catalogservice.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final ProductRepository productRepository;

    // Ручной конструктор вместо Lombok
    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProducts() {
        System.out.println("=== БЕРУ ТОВАРЫ ИЗ БАЗЫ ДАННЫХ ===");
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElseThrow();
    }

    @PostMapping
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }
}