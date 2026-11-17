package com.urechki.analytics_service.controller;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.urechki.analytics_service.model.AnalyticsEvent;
import com.urechki.analytics_service.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    /** Типы событий воронки и их русские подписи. */
    private static final List<Map.Entry<String, String>> FUNNEL_STAGES = List.of(
            Map.entry("view_product", "Просмотр товара"),
            Map.entry("add_to_cart", "Добавление в корзину"),
            Map.entry("checkout_start", "Начало оформления"),
            Map.entry("order_created", "Заказ создан")
    );

    private final AnalyticsEventRepository analyticsEventRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("service", "analytics-service");
        return result;
    }

    /**
     * Принимаем произвольный JSON. Все поля необязательны: отсутствующие или
     * некорректные значения просто сохраняются как null, запрос не падает.
     */
    @PostMapping("/events")
    public AnalyticsEvent recordEvent(@RequestBody Map<String, Object> body) {
        Map<String, Object> event = body == null ? Map.of() : body;
        Map<String, Object> nested = nestedPayload(event);

        String type = asText(first(
                event.get("type"), event.get("event"), event.get("eventType"),
                nested.get("type"), nested.get("event")));
        Long customerId = asLong(first(
                event.get("customerId"), event.get("customer_id"),
                nested.get("customerId"), nested.get("customer_id")));
        Long productId = asLong(first(
                event.get("productId"), event.get("product_id"),
                nested.get("productId"), nested.get("product_id")));
        BigDecimal amount = asDecimal(first(
                event.get("amount"), event.get("total"), event.get("revenue"),
                nested.get("amount"), nested.get("total"), nested.get("revenue")));

        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (Exception ex) {
            payload = String.valueOf(event);
        }

        AnalyticsEvent analyticsEvent = new AnalyticsEvent();
        analyticsEvent.setType(type);
        analyticsEvent.setCustomerId(customerId);
        analyticsEvent.setProductId(productId);
        analyticsEvent.setAmount(amount);
        analyticsEvent.setPayload(payload);
        analyticsEvent.setCreatedAt(LocalDateTime.now());
        return analyticsEventRepository.save(analyticsEvent);
    }

    /** Все показатели считаются только по сохранённым событиям. */
    @GetMapping("/summary")
    public Map<String, Object> summary() {
        long events = analyticsEventRepository.count();

        BigDecimal revenue = analyticsEventRepository.sumPositiveAmounts();
        if (revenue == null) revenue = BigDecimal.ZERO;
        revenue = revenue.setScale(2, RoundingMode.HALF_UP);

        long uniqueCustomers = analyticsEventRepository.countUniqueCustomers();
        long last24hEvents = analyticsEventRepository.countSince(LocalDateTime.now().minusHours(24));

        Map<String, Long> productCounts = new LinkedHashMap<>();
        for (Object[] row : analyticsEventRepository.countByProduct()) {
            if (row[0] != null && row[1] != null) {
                productCounts.merge(String.valueOf(row[0]), ((Number) row[1]).longValue(), Long::sum);
            }
        }
        // productId может прийти внутри payload — учитываем и такие события.
        for (AnalyticsEvent event : analyticsEventRepository.findByProductIdIsNullAndPayloadIsNotNull()) {
            Long productId = productIdFromPayload(event.getPayload());
            if (productId != null) {
                productCounts.merge(String.valueOf(productId), 1L, Long::sum);
            }
        }
        Map<String, Long> topProducts = productCounts.entrySet().stream()
                .sorted((a, b) -> {
                    int byCount = Long.compare(b.getValue(), a.getValue());
                    return byCount != 0 ? byCount : a.getKey().compareTo(b.getKey());
                })
                .limit(10)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("events", events);
        result.put("revenue", revenue);
        result.put("uniqueCustomers", uniqueCustomers);
        result.put("topProducts", topProducts);
        result.put("last24hEvents", last24hEvents);
        return result;
    }

    /** Воронка по фактическим событиям: конверсии считаются из реальных счётчиков. */
    @GetMapping("/funnel")
    public Map<String, Object> funnel() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Object[] row : analyticsEventRepository.countByType()) {
            if (row[0] != null && row[1] != null) {
                counts.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
            }
        }

        long firstCount = counts.getOrDefault(FUNNEL_STAGES.get(0).getKey(), 0L);
        long previous = firstCount;

        List<Map<String, Object>> stages = new ArrayList<>();
        for (Map.Entry<String, String> stage : FUNNEL_STAGES) {
            long count = counts.getOrDefault(stage.getKey(), 0L);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("key", stage.getKey());
            item.put("label", stage.getValue());
            item.put("count", count);
            item.put("conversionFromPrevious", percent(count, previous));
            item.put("conversionFromFirst", percent(count, firstCount));
            stages.add(item);
            previous = count;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("stages", stages);
        result.put("note", "Счётчики и конверсии рассчитаны только по сохранённым событиям — демонстрационные данные не подставляются.");
        return result;
    }

    @GetMapping("/recent")
    public List<AnalyticsEvent> recent(@RequestParam(defaultValue = "20") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return analyticsEventRepository.findAll(
                PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
    }

    private static BigDecimal percent(long count, long base) {
        if (base <= 0) return BigDecimal.ZERO.setScale(1);
        return BigDecimal.valueOf(count)
                .multiply(HUNDRED)
                .divide(BigDecimal.valueOf(base), 1, RoundingMode.HALF_UP);
    }

    private static Object first(Object... values) {
        for (Object value : values) {
            if (value != null) return value;
        }
        return null;
    }

    private static String asText(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return null;
        // Ограничиваем длину, чтобы длинный мусор в событии не сломал вставку в БД.
        return text.length() > 255 ? text.substring(0, 255) : text;
    }

    private static Long asLong(Object value) {
        if (value == null || value instanceof Boolean) return null;
        if (value instanceof Number number) return number.longValue();
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return null;
        try {
            return Long.valueOf(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static BigDecimal asDecimal(Object value) {
        if (value == null || value instanceof Boolean) return null;
        if (value instanceof Number number) {
            try {
                return new BigDecimal(number.toString());
            } catch (NumberFormatException ex) {
                return null;
            }
        }
        String text = String.valueOf(value).trim().replace(",", ".");
        if (text.isEmpty()) return null;
        try {
            return new BigDecimal(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /** Разбираем вложенный payload: это может быть объект или JSON-строка. */
    private Map<String, Object> nestedPayload(Map<String, Object> body) {
        Object raw = body.get("payload");
        if (raw instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            map.forEach((key, value) -> result.put(String.valueOf(key), value));
            return result;
        }
        if (raw instanceof String text && !text.isBlank()) {
            try {
                Map<String, Object> parsed = objectMapper.readValue(text, new TypeReference<Map<String, Object>>() {});
                if (parsed != null) return parsed;
            } catch (Exception ignored) {
                // Некорректная строка — просто не даём дополнительных полей.
            }
        }
        return Map.of();
    }

    private Long productIdFromPayload(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            Map<String, Object> parsed = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            if (parsed == null) return null;
            Long direct = asLong(first(parsed.get("productId"), parsed.get("product_id")));
            if (direct != null) return direct;
            Map<String, Object> nested = nestedPayload(parsed);
            return asLong(first(nested.get("productId"), nested.get("product_id")));
        } catch (Exception ex) {
            return null;
        }
    }
}
