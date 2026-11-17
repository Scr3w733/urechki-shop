package com.urechki.order_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        // HttpComponents поддерживает PATCH — SimpleClientHttpRequestFactory его не умеет.
        return new RestTemplate(new HttpComponentsClientHttpRequestFactory());
    }
}
