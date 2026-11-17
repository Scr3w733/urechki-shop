package com.urechki.loyalty_service.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Уровни программы лояльности. Повышение происходит при выполнении любого
 * из двух условий: накопленной суммы покупок или количества заказов.
 */
public enum LoyaltyLevel {
    NOVICE("Новичок", 3, 0, null, null),
    REGULAR("Постоянный", 5, 3, BigDecimal.valueOf(10_000), 5),
    VIP("ВИП", 8, 5, BigDecimal.valueOf(30_000), 15);

    private final String title;
    private final int cashbackPercent;
    private final int discountPercent;
    private final BigDecimal spentThreshold;
    private final Integer ordersThreshold;

    LoyaltyLevel(String title, int cashbackPercent, int discountPercent,
                 BigDecimal spentThreshold, Integer ordersThreshold) {
        this.title = title;
        this.cashbackPercent = cashbackPercent;
        this.discountPercent = discountPercent;
        this.spentThreshold = spentThreshold;
        this.ordersThreshold = ordersThreshold;
    }

    public String getTitle() {
        return title;
    }

    public int getCashbackPercent() {
        return cashbackPercent;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    public boolean isReached(BigDecimal spentTotal, int orderCount) {
        if (spentThreshold == null) {
            return false;
        }
        BigDecimal spent = spentTotal == null ? BigDecimal.ZERO : spentTotal;
        return spent.compareTo(spentThreshold) >= 0 || orderCount >= ordersThreshold;
    }

    public static LoyaltyLevel resolve(BigDecimal spentTotal, int orderCount) {
        if (VIP.isReached(spentTotal, orderCount)) {
            return VIP;
        }
        if (REGULAR.isReached(spentTotal, orderCount)) {
            return REGULAR;
        }
        return NOVICE;
    }

    public static LoyaltyLevel fromTitle(String title) {
        for (LoyaltyLevel level : values()) {
            if (level.title.equals(title)) {
                return level;
            }
        }
        return NOVICE;
    }

    public LoyaltyLevel next() {
        LoyaltyLevel[] levels = values();
        return ordinal() + 1 < levels.length ? levels[ordinal() + 1] : null;
    }

    /** Баллы, начисляемые за покупку на этом уровне (по правилу банковского округления). */
    public long calculateBonus(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            return 0L;
        }
        return amount.multiply(BigDecimal.valueOf(cashbackPercent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                .longValue();
    }

    /**
     * Остаток оборота (в баллах, 1 балл = 1 рубль оборота) до следующего уровня.
     * Для максимального уровня возвращается 0.
     */
    public long pointsToNextLevel(BigDecimal spentTotal) {
        LoyaltyLevel following = next();
        if (following == null || following.spentThreshold == null) {
            return 0L;
        }
        BigDecimal spent = spentTotal == null ? BigDecimal.ZERO : spentTotal;
        return following.spentThreshold.subtract(spent).max(BigDecimal.ZERO)
                .setScale(0, RoundingMode.CEILING)
                .longValue();
    }
}
