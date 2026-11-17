package com.urechki.loyalty_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyQuote {
    private String level;
    private int cashbackPercent;
    private long bonusPointsEarned;
    private int discountPercent;
    private String nextLevel;
    private long pointsToNextLevel;
}
