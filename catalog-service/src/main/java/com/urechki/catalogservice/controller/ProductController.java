package com.urechki.catalogservice.controller;

import com.urechki.catalogservice.model.Product;
import com.urechki.catalogservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Получение каталога с необязательными фильтрами.
     * Пример: /api/products?category=Пиво&search=IPA&minPrice=100&maxPrice=500&sort=price-asc
     */
    @GetMapping
    @Cacheable(value = "products")
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "false") boolean onlyInStock,
            @RequestParam(required = false, defaultValue = "default") String sort
    ) {
        List<Product> result = new java.util.ArrayList<>(productRepository.findAll());

        if (category != null && !category.isBlank() && !"Все".equalsIgnoreCase(category)) {
            result.removeIf(p -> !category.equalsIgnoreCase(nullToEmpty(p.getCategory())));
        }
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase(Locale.ROOT);
            result.removeIf(p -> !nullToEmpty(p.getName()).toLowerCase(Locale.ROOT).contains(q)
                    && !nullToEmpty(p.getDescription()).toLowerCase(Locale.ROOT).contains(q));
        }
        if (minPrice != null) {
            result.removeIf(p -> p.getPrice() == null || p.getPrice().compareTo(minPrice) < 0);
        }
        if (maxPrice != null) {
            result.removeIf(p -> p.getPrice() == null || p.getPrice().compareTo(maxPrice) > 0);
        }
        if (onlyInStock) {
            result.removeIf(p -> p.getStockQuantity() == null || p.getStockQuantity() <= 0);
        }

        switch (sort == null ? "default" : sort) {
            case "price-asc" -> result.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(BigDecimal::compareTo)));
            case "price-desc" -> result.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(BigDecimal::compareTo)).reversed());
            case "name" -> result.sort(Comparator.comparing(p -> nullToEmpty(p.getName()).toLowerCase(Locale.ROOT)));
            case "stock" -> result.sort(Comparator.comparing(Product::getStockQuantity, Comparator.nullsLast(Integer::compareTo)).reversed());
            default -> { /* сохраняем порядок из БД */ }
        }
        return result;
    }

    @GetMapping("/categories")
    public Set<String> getCategories() {
        Set<String> categories = new LinkedHashSet<>();
        productRepository.findAll().forEach(p -> {
            if (p.getCategory() != null && !p.getCategory().isBlank()) categories.add(p.getCategory());
        });
        return categories;
    }

    @GetMapping("/{id}")
    @Cacheable(value = "product")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден"));
    }

    @PostMapping
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product createProduct(@RequestBody Product product) {
        validate(product);
        // POST всегда создаёт новый товар: клиент не может перезаписать существующий id
        product.setId(null);
        if (product.getStockQuantity() == null) product.setStockQuantity(0);
        Product saved = productRepository.save(product);
        log.info("Создан товар #{}: {}", saved.getId(), saved.getName());
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден"));
        validate(product);
        existing.setName(product.getName());
        existing.setCategory(product.getCategory());
        existing.setPrice(product.getPrice());
        existing.setDescription(product.getDescription());
        if (product.getStockQuantity() != null) existing.setStockQuantity(product.getStockQuantity());
        return productRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Map<String, Object> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден");
        }
        productRepository.deleteById(id);
        return Map.of("deleted", true, "id", id);
    }

    /**
     * Атомарное изменение остатка. Положительное quantity — приход, отрицательное — списание.
     * Используется order-service для резервирования товара.
     */
    @PatchMapping("/{id}/stock")
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product changeStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer delta = body.get("quantity");
        if (delta == null || delta == 0) {
            throw new IllegalArgumentException("Укажите ненулевое quantity");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден"));
        int current = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        int next = current + delta;
        if (next < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недостаточно товара на складе");
        }
        product.setStockQuantity(next);
        return productRepository.save(product);
    }

    private void validate(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("Название товара обязательно");
        }
        if (product.getCategory() == null || product.getCategory().isBlank()) {
            throw new IllegalArgumentException("Категория товара обязательна");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Цена должна быть больше нуля");
        }
        if (product.getStockQuantity() != null && product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Остаток не может быть отрицательным");
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
