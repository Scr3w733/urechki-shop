package com.urechki.favorites_service.repository;

import com.urechki.favorites_service.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByCustomerIdOrderByCreatedAtAsc(Long customerId);

    Optional<Favorite> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    long countByCustomerId(Long customerId);
}
