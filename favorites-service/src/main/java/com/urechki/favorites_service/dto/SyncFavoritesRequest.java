package com.urechki.favorites_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class SyncFavoritesRequest {
    private List<Long> productIds;
}
