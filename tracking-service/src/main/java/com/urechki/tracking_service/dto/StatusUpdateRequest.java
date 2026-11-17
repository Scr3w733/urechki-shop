package com.urechki.tracking_service.dto;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;
    private String note;
    private String location;
}
