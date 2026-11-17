package com.urechki.analytics_service.repository;

import com.urechki.analytics_service.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    /** Выручка = сумма только положительных сумм; отрицательные корректировки не вычитаем. */
    @Query("select sum(e.amount) from AnalyticsEvent e where e.amount > 0")
    BigDecimal sumPositiveAmounts();

    @Query("select count(distinct e.customerId) from AnalyticsEvent e where e.customerId is not null")
    long countUniqueCustomers();

    @Query("select count(e) from AnalyticsEvent e where e.createdAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    /** Строки: [тип события, количество]. */
    @Query("select e.type, count(e) from AnalyticsEvent e where e.type is not null group by e.type")
    List<Object[]> countByType();

    /** Строки: [productId, количество]. */
    @Query("select e.productId, count(e) from AnalyticsEvent e where e.productId is not null group by e.productId")
    List<Object[]> countByProduct();

    /** События, у которых productId был только внутри payload. */
    List<AnalyticsEvent> findByProductIdIsNullAndPayloadIsNotNull();
}
