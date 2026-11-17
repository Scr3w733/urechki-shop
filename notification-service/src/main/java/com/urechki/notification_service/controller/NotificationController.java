package com.urechki.notification_service.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private final List<Map<String, Object>> history = Collections.synchronizedList(new ArrayList<>());

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "service", "notification-service");
    }

    @PostMapping("/send")
    public Map<String, Object> sendNotification(@RequestBody Map<String, String> request) {
        String email = request.get("email") == null ? "" : request.get("email").trim();
        String message = request.get("message") == null ? "" : request.get("message").trim();

        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Некорректный email получателя");
        }
        if (message.isEmpty()) {
            throw new IllegalArgumentException("Текст уведомления не может быть пустым");
        }

        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", history.size() + 1);
        record.put("email", email.toLowerCase(Locale.ROOT));
        record.put("message", message);
        record.put("sentAt", Instant.now().toString());
        history.add(record);
        if (history.size() > 200) history.remove(0);

        log.info("Уведомление отправлено на {}: {}", email, message);
        return Map.of("sent", true, "id", record.get("id"));
    }

    @GetMapping
    public List<Map<String, Object>> getHistory(@RequestParam(required = false) String email) {
        synchronized (history) {
            if (email == null || email.isBlank()) return new ArrayList<>(history);
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            return history.stream()
                    .filter(item -> normalized.equals(item.get("email")))
                    .toList();
        }
    }

    @DeleteMapping
    public Map<String, Object> clearHistory() {
        history.clear();
        return Map.of("cleared", true);
    }
}
