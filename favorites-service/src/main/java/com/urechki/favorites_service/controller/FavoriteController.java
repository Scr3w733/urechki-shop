package com.urechki.favorites_service.controller;

import com.urechki.favorites_service.dto.FavoriteRequest;
import com.urechki.favorites_service.dto.SyncFavoritesRequest;
import com.urechki.favorites_service.model.Favorite;
import com.urechki.favorites_service.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("service", "favorites-service");
        return result;
    }

    /** Все товары клиента в порядке добавления. */
    @GetMapping("/{customerId}")
    public List<Long> getFavorites(@PathVariable Long customerId) {
        return favoriteRepository.findByCustomerIdOrderByCreatedAtAsc(customerId).stream()
                .map(Favorite::getProductId)
                .toList();
    }

    /** Повторное добавление ничего не меняет — ответ идемпотентен. */
    @PostMapping("/{customerId}")
    @Transactional
    public Favorite addFavorite(@PathVariable Long customerId, @RequestBody FavoriteRequest request) {
        Long productId = request == null ? null : request.getProductId();
        if (productId == null) {
            throw new IllegalArgumentException("Укажите товар (productId)");
        }
        return favoriteRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseGet(() -> {
                    Favorite favorite = new Favorite();
                    favorite.setCustomerId(customerId);
                    favorite.setProductId(productId);
                    return favoriteRepository.save(favorite);
                });
    }

    /** Удаление тоже идемпотентно: removed=false, если записи не было. */
    @DeleteMapping("/{customerId}/{productId}")
    @Transactional
    public Map<String, Object> removeFavorite(@PathVariable Long customerId, @PathVariable Long productId) {
        Optional<Favorite> existing = favoriteRepository.findByCustomerIdAndProductId(customerId, productId);
        existing.ifPresent(favoriteRepository::delete);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("removed", existing.isPresent());
        return result;
    }

    /**
     * Полная замена списка избранного клиента в одной транзакции.
     * Лишние записи удаляются, недостающие добавляются; порядок — как в присланном списке.
     */
    @PostMapping("/{customerId}/sync")
    @Transactional
    public List<Long> syncFavorites(@PathVariable Long customerId, @RequestBody SyncFavoritesRequest request) {
        if (request == null || request.getProductIds() == null) {
            throw new IllegalArgumentException("Укажите список товаров (productIds)");
        }

        LinkedHashSet<Long> desired = new LinkedHashSet<>();
        for (Long productId : request.getProductIds()) {
            if (productId != null) {
                desired.add(productId);
            }
        }

        List<Favorite> existing = favoriteRepository.findByCustomerIdOrderByCreatedAtAsc(customerId);
        Set<Long> existingIds = existing.stream().map(Favorite::getProductId).collect(Collectors.toSet());

        List<Favorite> toRemove = existing.stream()
                .filter(favorite -> !desired.contains(favorite.getProductId()))
                .toList();
        if (!toRemove.isEmpty()) {
            favoriteRepository.deleteAllInBatch(toRemove);
        }

        List<Favorite> toAdd = new ArrayList<>();
        for (Long productId : desired) {
            if (!existingIds.contains(productId)) {
                Favorite favorite = new Favorite();
                favorite.setCustomerId(customerId);
                favorite.setProductId(productId);
                toAdd.add(favorite);
            }
        }
        if (!toAdd.isEmpty()) {
            favoriteRepository.saveAll(toAdd);
        }

        return new ArrayList<>(desired);
    }

    @GetMapping("/{customerId}/count")
    public long countFavorites(@PathVariable Long customerId) {
        return favoriteRepository.countByCustomerId(customerId);
    }
}
