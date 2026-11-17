package com.urechki.tracking_service.dto;

import com.urechki.tracking_service.model.Shipment;
import com.urechki.tracking_service.model.TrackingEvent;
import lombok.Data;

import java.util.List;

@Data
public class TrackingView {
    private Shipment shipment;
    private List<TrackingEvent> events;
    private Integer progressPercent;
    private String humanStatus;
}
