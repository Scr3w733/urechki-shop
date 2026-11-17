package com.urechki.tracking_service.service;

import com.urechki.tracking_service.dto.ShipmentCreateRequest;
import com.urechki.tracking_service.dto.StatusUpdateRequest;
import com.urechki.tracking_service.dto.TrackingView;
import com.urechki.tracking_service.model.Shipment;
import com.urechki.tracking_service.model.TrackingEvent;
import com.urechki.tracking_service.repository.ShipmentRepository;
import com.urechki.tracking_service.repository.TrackingEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TrackingService {

    public static final String STATUS_COLLECTING = "Собирается";
    public static final String STATUS_HANDED_OVER = "Передан в доставку";
    public static final String STATUS_IN_TRANSIT = "В пути";
    public static final String STATUS_DELIVERED = "Доставлен";
    public static final String STATUS_CANCELLED = "Отменён";
    public static final String DEFAULT_COURIER = "Курьер У Речушки";

    private static final List<String> ALLOWED_STATUSES = List.of(
            STATUS_COLLECTING, STATUS_HANDED_OVER, STATUS_IN_TRANSIT, STATUS_DELIVERED, STATUS_CANCELLED);

    // Прогресс — условная шкала для интерфейса, а не реальная доля пути.
    private static final Map<String, Integer> PROGRESS_BY_STATUS = Map.of(
            STATUS_COLLECTING, 10,
            STATUS_HANDED_OVER, 35,
            STATUS_IN_TRANSIT, 65,
            STATUS_DELIVERED, 100,
            STATUS_CANCELLED, 0);

    // Человекочитаемая формулировка того же статуса (для web и mobile).
    private static final Map<String, String> HUMAN_STATUS_BY_STATUS = Map.of(
            STATUS_COLLECTING, "Собираем заказ",
            STATUS_HANDED_OVER, "Заказ передан курьеру",
            STATUS_IN_TRANSIT, "Курьер в пути",
            STATUS_DELIVERED, "Заказ доставлен",
            STATUS_CANCELLED, "Заказ отменён");

    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;

    @Transactional
    public Shipment createShipment(ShipmentCreateRequest request) {
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Укажите номер заказа (orderId)");
        }
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Укажите клиента (customerId)");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Укажите адрес доставки");
        }

        // Повторный запрос с тем же orderId ничего не меняет: статус и события не сбрасываются.
        return shipmentRepository.findByOrderId(request.getOrderId()).orElseGet(() -> {
            Shipment shipment = new Shipment();
            shipment.setOrderId(request.getOrderId());
            shipment.setCustomerId(request.getCustomerId());
            shipment.setAddress(request.getAddress().trim());
            shipment.setCourier(request.getCourier() == null || request.getCourier().isBlank()
                    ? DEFAULT_COURIER : request.getCourier().trim());
            shipment.setStatus(STATUS_COLLECTING);
            shipment.setEta(LocalDateTime.now().plusDays(2));

            Shipment saved = shipmentRepository.save(shipment);
            trackingEventRepository.save(buildEvent(saved.getId(), STATUS_COLLECTING,
                    "Отправление зарегистрировано", null));
            return saved;
        });
    }

    @Transactional(readOnly = true)
    public Optional<Shipment> findShipmentByOrderId(Long orderId) {
        return shipmentRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public TrackingView getTracking(Long orderId) {
        return buildView(requireShipment(orderId));
    }

    @Transactional
    public TrackingView updateStatus(Long orderId, StatusUpdateRequest request) {
        String status = request == null ? null : request.getStatus();
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Укажите новый статус");
        }
        String newStatus = status.trim();
        if (!ALLOWED_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Неизвестный статус '" + newStatus + "'. Допустимые статусы: "
                            + String.join(", ", ALLOWED_STATUSES));
        }

        Shipment shipment = requireShipment(orderId);
        shipment.setStatus(newStatus);
        trackingEventRepository.save(buildEvent(shipment.getId(), newStatus,
                request.getNote(), request.getLocation()));
        return buildView(shipment);
    }

    @Transactional(readOnly = true)
    public List<Shipment> getCustomerShipments(Long customerId) {
        return shipmentRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    private Shipment requireShipment(Long orderId) {
        if (orderId == null) {
            throw new IllegalArgumentException("Укажите номер заказа (orderId)");
        }
        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Отправление для заказа #" + orderId + " не найдено"));
    }

    private TrackingEvent buildEvent(Long shipmentId, String status, String note, String location) {
        TrackingEvent event = new TrackingEvent();
        event.setShipmentId(shipmentId);
        event.setStatus(status);
        event.setNote(note == null || note.isBlank() ? null : note.trim());
        event.setLocation(location == null || location.isBlank() ? null : location.trim());
        event.setCreatedAt(LocalDateTime.now());
        return event;
    }

    private TrackingView buildView(Shipment shipment) {
        TrackingView view = new TrackingView();
        view.setShipment(shipment);
        view.setEvents(trackingEventRepository.findAllByShipmentIdOrderByCreatedAtDescIdDesc(shipment.getId()));
        view.setProgressPercent(PROGRESS_BY_STATUS.getOrDefault(shipment.getStatus(), 0));
        view.setHumanStatus(HUMAN_STATUS_BY_STATUS.getOrDefault(shipment.getStatus(), shipment.getStatus()));
        return view;
    }
}
