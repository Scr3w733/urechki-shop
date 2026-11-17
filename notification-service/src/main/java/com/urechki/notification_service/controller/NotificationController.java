package com.urechki.notification_service.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @PostMapping("/send")
    public String sendNotification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String message = request.get("message");

        // Имитация отправки email. В реальности здесь был бы JavaMailSender
        System.out.println("==================================================");
        System.out.println("📧 ОТПРАВЛЕНО УВЕДОМЛЕНИЕ НА ПОЧТУ: " + email);
        System.out.println("📝 ТЕКСТ: " + message);
        System.out.println("==================================================");

        return "Уведомление успешно отправлено!";
    }
}