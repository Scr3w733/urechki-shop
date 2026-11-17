package com.urechki.tracking_service.repository;

import com.urechki.tracking_service.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    List<Shipment> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
