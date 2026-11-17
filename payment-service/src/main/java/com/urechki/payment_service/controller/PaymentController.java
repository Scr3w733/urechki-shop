package com.urechki.payment_service.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final Map<String, Map<String, Object>> idempotencyCache = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> transactions = new ConcurrentHashMap<>();

    @Value("${app.payment.limit:100000}")
    private BigDecimal limit;

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "service", "payment-service");
    }

    @PostMapping("/process")
    public Map<String, Object> processPayment(@RequestBody Map<String, Object> request) {
        BigDecimal amount = parseAmount(request.get("amount"));
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Сумма платежа должна быть больше нуля");
        }

        String method = request.get("method") == null ? "Банковская карта" : request.get("method").toString();
        String idempotencyKey = request.get("idempotencyKey") == null
                ? null : request.get("idempotencyKey").toString();

        if (idempotencyKey != null && idempotencyCache.containsKey(idempotencyKey)) {
            log.info("Повторный запрос оплаты по ключу {}", idempotencyKey);
            return idempotencyCache.get(idempotencyKey);
        }

        boolean approved = amount.compareTo(limit) <= 0;
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", approved ? "SUCCESS" : "FAILED");
        response.put("message", approved
                ? "Платёж успешно проведён"
                : "Превышен лимит операции: " + limit + " руб.");
        response.put("amount", amount);
        response.put("method", method);

        if (approved) {
            String transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            response.put("transactionId", transactionId);
            response.put("timestamp", java.time.Instant.now().toString());
            Map<String, Object> record = new LinkedHashMap<>(response);
            transactions.put(transactionId, record);
        } else {
            response.put("transactionId", null);
            log.warn("Оплата отклонена: сумма {} превышает лимит {}", amount, limit);
        }

        if (idempotencyKey != null) idempotencyCache.put(idempotencyKey, response);
        log.info("Оплата {}: {} руб. через {}", approved ? "одобрена" : "отклонена", amount, method);
        return response;
    }

    @GetMapping("/{transactionId}")
    public Map<String, Object> getTransaction(@PathVariable String transactionId) {
        Map<String, Object> record = transactions.get(transactionId);
        if (record == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Транзакция не найдена");
        }
        return record;
    }

    @PostMapping("/refund")
    public Map<String, Object> refund(@RequestBody Map<String, String> request) {
        String transactionId = request.get("transactionId");
        if (transactionId == null || !transactions.containsKey(transactionId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Транзакция не найдена");
        }
        Map<String, Object> record = transactions.get(transactionId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "REFUNDED");
        response.put("transactionId", transactionId);
        response.put("amount", record.get("amount"));
        response.put("message", "Возврат выполнен");
        return response;
    }

    private BigDecimal parseAmount(Object value) {
        if (value == null) throw new IllegalArgumentException("Укажите сумму платежа");
        try {
            return new BigDecimal(value.toString()).setScale(2, java.math.RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Некорректная сумма платежа");
        }
    }
}
