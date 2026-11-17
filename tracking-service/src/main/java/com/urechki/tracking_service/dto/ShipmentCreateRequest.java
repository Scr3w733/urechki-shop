package com.urechki.tracking_service.dto;

import lombok.Data;

@Data
public class ShipmentCreateRequest {
    private Long orderId;
    private Long customerId;
    private String address;
    private String courier;
}
