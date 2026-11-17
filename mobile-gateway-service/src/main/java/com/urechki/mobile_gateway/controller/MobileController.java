package com.urechki.mobile_gateway.controller;

import tools.jackson.databind.JsonNode;
import com.urechki.mobile_gateway.service.MobileGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MobileController {

    private final MobileGatewayService service;

    @GetMapping("/health")
    public Map<String, Object> health() {
        return service.health();
    }

    @GetMapping("/home")
    public Map<String, Object> home(@RequestParam(required = false) String customerId) {
        return service.home(customerId);
    }

    @GetMapping("/catalog")
    public Map<String, Object> catalog(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        return service.catalog(category, search, limit);
    }

    @GetMapping("/product/{id}")
    public Map<String, Object> product(@PathVariable Long id) {
        return service.product(id);
    }

    @GetMapping("/profile/{customerId}")
    public Map<String, Object> profile(@PathVariable Long customerId) {
        return service.profile(customerId);
    }

    @PostMapping("/favorites/{customerId}")
    public Object addFavorite(@PathVariable Long customerId,
                              @RequestBody(required = false) JsonNode body) {
        return service.addFavorite(customerId, body);
    }

    @DeleteMapping("/favorites/{customerId}/{productId}")
    public Object removeFavorite(@PathVariable Long customerId, @PathVariable Long productId) {
        return service.removeFavorite(customerId, productId);
    }

    @PostMapping("/events")
    public Map<String, Object> events(@RequestBody(required = false) JsonNode body) {
        return service.sendEvent(body);
    }

    @GetMapping("/orders/{customerId}")
    public Map<String, Object> orders(@PathVariable Long customerId) {
        return service.orders(customerId);
    }
}
