package com.urechki.loyalty_service.repository;

import com.urechki.loyalty_service.model.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {
    Optional<LoyaltyTransaction> findByOrderId(Long orderId);

    List<LoyaltyTransaction> findTop50ByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
