package com.urechki.tracking_service.repository;

import com.urechki.tracking_service.model.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    // Сначала новые; id на случай, если события попали в одну секунду.
    List<TrackingEvent> findAllByShipmentIdOrderByCreatedAtDescIdDesc(Long shipmentId);
}
