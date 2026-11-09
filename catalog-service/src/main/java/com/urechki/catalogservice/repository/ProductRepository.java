package com.urechki.catalogservice.repository;

import com.urechki.catalogservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
