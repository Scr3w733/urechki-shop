package com.urechki.catalogservice.repository;

import com.urechki.catalogservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Атомарное изменение остатка: обновление происходит, только если результат не отрицательный.
     * Возвращает число обновлённых строк — 0 означает, что товара не хватило.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Product p set p.stockQuantity = coalesce(p.stockQuantity, 0) + :delta " +
            "where p.id = :id and coalesce(p.stockQuantity, 0) + :delta >= 0")
    int adjustStock(@Param("id") Long id, @Param("delta") int delta);
}
