package com.urechki.loyalty_service.controller;

import com.urechki.loyalty_service.dto.AccrueRequest;
import com.urechki.loyalty_service.dto.LoyaltyQuote;
import com.urechki.loyalty_service.dto.LoyaltyQuoteRequest;
import com.urechki.loyalty_service.model.LoyaltyAccount;
import com.urechki.loyalty_service.model.LoyaltyTransaction;
import com.urechki.loyalty_service.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "loyalty-service");
        return body;
    }

    @GetMapping("/accounts/{customerId}")
    public LoyaltyAccount getAccount(@PathVariable Long customerId) {
        return loyaltyService.getOrCreateAccount(customerId);
    }

    @PostMapping("/quote")
    public LoyaltyQuote quote(@RequestBody LoyaltyQuoteRequest request) {
        return loyaltyService.quote(request);
    }

    @PostMapping("/accrue")
    public LoyaltyAccount accrue(@RequestBody AccrueRequest request) {
        return loyaltyService.accrue(request);
    }

    @GetMapping("/history/{customerId}")
    public List<LoyaltyTransaction> history(@PathVariable Long customerId) {
        return loyaltyService.history(customerId);
    }
}
