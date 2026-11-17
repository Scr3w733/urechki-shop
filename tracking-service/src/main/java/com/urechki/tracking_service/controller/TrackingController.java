package com.urechki.tracking_service.controller;

import com.urechki.tracking_service.dto.ShipmentCreateRequest;
import com.urechki.tracking_service.dto.StatusUpdateRequest;
import com.urechki.tracking_service.dto.TrackingView;
import com.urechki.tracking_service.model.Shipment;
import com.urechki.tracking_service.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "tracking-service");
        body.put("port", 8087);
        return body;
    }

    @PostMapping("/shipments")
    public ResponseEntity<Shipment> createShipment(@RequestBody ShipmentCreateRequest request) {
        return trackingService.findShipmentByOrderId(request == null ? null : request.getOrderId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(trackingService.createShipment(request)));
    }

    @GetMapping("/shipments/{orderId}")
    public TrackingView getTracking(@PathVariable Long orderId) {
        return trackingService.getTracking(orderId);
    }

    @PatchMapping("/shipments/{orderId}/status")
    public TrackingView updateStatus(@PathVariable Long orderId,
                                     @RequestBody StatusUpdateRequest request) {
        return trackingService.updateStatus(orderId, request);
    }

    @GetMapping("/customer/{customerId}")
    public List<Shipment> getCustomerShipments(@PathVariable Long customerId) {
        return trackingService.getCustomerShipments(customerId);
    }
}
