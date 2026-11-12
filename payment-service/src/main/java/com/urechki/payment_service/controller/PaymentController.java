package com.urechki.payment_service.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/process")
    public Map<String, Object> processPayment(@RequestBody Map<String, Object> request) {
        double amount = Double.parseDouble(request.get("amount").toString());
        String method = request.get("method") != null ? request.get("method").toString() : "Банковская карта";
        
        System.out.println("==================================================");
        System.out.println("💳 ЗАПРОС НА ОПЛАТУ: Сумма " + amount + " руб.");
        System.out.println("🏦 ПЛАТЕЖНАЯ СИСТЕМА: " + method);
        
        Map<String, Object> response = new HashMap<>();
        
        // Ограничение: если сумма больше 10000, банк отклоняет
        boolean isSuccess = amount <= 10000; 
        
        if (isSuccess) {
            System.out.println("✅ ОПЛАТА УСПЕШНА через " + method + "!");
            System.out.println("==================================================");
            response.put("status", "SUCCESS");
            response.put("message", "Платеж успешно проведен");
            response.put("transactionId", "TXN-" + System.currentTimeMillis());
        } else {
            System.out.println("❌ ОПЛАТА ОТКЛОНЕНА (Превышен лимит)!");
            System.out.println("==================================================");
            response.put("status", "FAILED");
            response.put("message", "Недостаточно средств или превышен лимит операции");
        }
        
        return response;
    }
}