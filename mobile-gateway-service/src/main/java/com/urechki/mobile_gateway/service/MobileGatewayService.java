package com.urechki.mobile_gateway.service;

import tools.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Агрегация нижестоящих сервисов для будущего React Native приложения.
 * Ответы строятся на JsonNode/Map, чтобы не быть связанными с DTO конкретных сервисов.
 */
@Service
@RequiredArgsConstructor
public class MobileGatewayService {

    private static final Logger log = LoggerFactory.getLogger(MobileGatewayService.class);

    private static final int FEATURED_LIMIT = 8;
    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;
    private static final int ORDERS_IN_PROFILE = 5;

    private static final Pattern VOLUME = Pattern.compile(
            "(\\d+[,.]?\\d*)\\s*(литра?|л|мл)", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    private static final Pattern ABV = Pattern.compile("(\\d+[,.]?\\d*)\\s*%");

    private final RestTemplate restTemplate;

    @Value("${app.services.catalog:http://catalog-service:8080}")
    private String catalogUrl;
    @Value("${app.services.crm:http://crm-service:8081}")
    private String crmUrl;
    @Value("${app.services.orders:http://order-service:8082}")
    private String ordersUrl;
    @Value("${app.services.loyalty:http://loyalty-service:8086}")
    private String loyaltyUrl;
    @Value("${app.services.tracking:http://tracking-service:8087}")
    private String trackingUrl;
    @Value("${app.services.favorites:http://favorites-service:8088}")
    private String favoritesUrl;
    @Value("${app.services.notifications:http://notification-service:8084}")
    private String notificationsUrl;
    @Value("${app.services.analytics:http://analytics-service:8089}")
    private String analyticsUrl;

    // ------------------------------------------------------------------ health

    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("service", "mobile-gateway");
        result.put("message", "Мобильный шлюз работает");
        result.put("timestamp", Instant.now().toString());
        return result;
    }

    // -------------------------------------------------------------------- home

    public Map<String, Object> home(String customerId) {
        List<String> categories = asStrings(fetchFirstJson(catalogUrl, List.of("/api/products/categories")).data());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hero", hero());
        result.put("categories", categories);
        result.put("featuredProducts", featuredProducts());
        result.put("loyaltyTeaser", loyaltyTeaser(customerId));
        result.put("features", appFeatures());
        result.put("timestamp", Instant.now().toString());
        return result;
    }

    private Map<String, Object> hero() {
        Map<String, Object> hero = new LinkedHashMap<>();
        hero.put("badge", "Доставка по городу");
        hero.put("title", "Любимое пиво — всегда под рукой");
        hero.put("subtitle", "Свежие сорта, бонусы за каждый заказ и избранное в одном приложении");
        hero.put("primaryButton", "Перейти в каталог");
        hero.put("secondaryButton", "Мои заказы");
        return hero;
    }

    private List<Map<String, Object>> appFeatures() {
        List<Map<String, Object>> features = new ArrayList<>();
        features.add(feature("catalog", "grid", "Каталог", "Сотни сортов с поиском и фильтрами"));
        features.add(feature("orders", "bag", "Заказы", "История покупок и статус доставки"));
        features.add(feature("loyalty", "gift", "Бонусы", "Копите баллы и оплачивайте ими заказы"));
        features.add(feature("favorites", "heart", "Избранное", "Сохраняйте любимые сорта в один тап"));
        features.add(feature("profile", "user", "Профиль", "Данные, скидки и настройки доставки"));
        return features;
    }

    private Map<String, Object> feature(String id, String icon, String title, String description) {
        Map<String, Object> feature = new LinkedHashMap<>();
        feature.put("id", id);
        feature.put("icon", icon);
        feature.put("title", title);
        feature.put("description", description);
        return feature;
    }

    private List<Map<String, Object>> featuredProducts() {
        FetchResult result = fetchFirstJson(catalogUrl, List.of("/api/products?onlyInStock=true"));
        List<Map<String, Object>> products = new ArrayList<>();
        if (result.data() != null && result.data().isArray()) {
            for (JsonNode product : result.data()) {
                if (!inStock(product)) continue;
                products.add(mobileProduct(product));
                if (products.size() >= FEATURED_LIMIT) break;
            }
        }
        return products;
    }

    private Map<String, Object> loyaltyTeaser(String customerId) {
        Map<String, Object> teaser = new LinkedHashMap<>();
        teaser.put("available", false);
        teaser.put("title", "Бонусы для своих");
        teaser.put("message", "Войдите в профиль, чтобы увидеть свои бонусы");
        teaser.put("error", null);

        if (customerId == null || customerId.isBlank()) {
            return teaser;
        }

        FetchResult result = fetchFirstJson(loyaltyUrl, loyaltyPaths(customerId));
        if (result.error() != null) {
            teaser.put("message", "Программа лояльности временно недоступна");
            teaser.put("error", result.error());
            return teaser;
        }
        if (result.data() == null || result.data().isNull()) {
            teaser.put("message", "Программа лояльности пока не подключена");
            return teaser;
        }

        String points = firstText(result.data(), "points", "balance", "bonusPoints", "bonusBalance", "amount");
        String tier = firstText(result.data(), "tier", "level", "status", "rank");
        teaser.put("available", true);
        teaser.put("points", points);
        teaser.put("tier", tier);
        teaser.put("title", tier == null || tier.isBlank() ? "Ваши бонусы" : "Уровень " + tier);
        teaser.put("message", points == null || points.isBlank()
                ? "Скоро здесь появятся ваши бонусы"
                : "У вас " + points + " бонусов — оплачивайте ими заказы");
        return teaser;
    }

    // ------------------------------------------------------------------ catalog

    public Map<String, Object> catalog(String category, String search, Integer limit) {
        int effectiveLimit = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));

        StringBuilder path = new StringBuilder("/api/products");
        List<String> params = new ArrayList<>();
        // RestTemplate сам кодирует URI-шаблон: ручная кодировка здесь даёт двойной
        // escape (%25D0...) и каталог возвращает пустой список для кириллицы.
        if (category != null && !category.isBlank()) {
            params.add("category=" + category);
        }
        if (search != null && !search.isBlank()) {
            params.add("search=" + search);
        }
        if (!params.isEmpty()) {
            path.append('?').append(String.join("&", params));
        }

        FetchResult productsResult = fetchFirstJson(catalogUrl, List.of(path.toString()));
        List<JsonNode> all = asArray(productsResult.data());

        List<Map<String, Object>> products = new ArrayList<>();
        for (JsonNode product : all) {
            if (products.size() >= effectiveLimit) break;
            products.add(mobileProduct(product));
        }

        List<String> categories = asStrings(fetchFirstJson(catalogUrl, List.of("/api/products/categories")).data());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("products", products);
        result.put("total", all.size());
        result.put("categories", categories);
        result.put("category", category);
        result.put("search", search);
        result.put("limit", effectiveLimit);
        if (productsResult.error() != null) {
            result.put("error", productsResult.error());
        }
        return result;
    }

    public Map<String, Object> product(Long id) {
        FetchResult result = fetchFirstJson(catalogUrl, List.of("/api/products/" + id));
        if (result.error() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Каталог временно недоступен");
        }
        if (result.data() == null || result.data().isNull()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден");
        }

        Map<String, Object> product = mobileProduct(result.data());
        product.put("specs", specs(result.data()));
        product.put("badges", inStock(result.data())
                ? List.of("В наличии") : List.of("Нет в наличии"));
        return product;
    }

    private List<Map<String, Object>> specs(JsonNode product) {
        String name = text(product.get("name"));
        String lower = name.toLowerCase(Locale.ROOT);

        List<Map<String, Object>> specs = new ArrayList<>();
        specs.add(spec("Состав", composition(lower), "Точный состав указан на упаковке"));
        specs.add(spec("Стиль", style(lower), null));

        Matcher volume = VOLUME.matcher(name);
        if (volume.find()) {
            String unit = volume.group(2).toLowerCase(Locale.ROOT);
            if (unit.startsWith("литр")) unit = "л";
            specs.add(spec("Объём", volume.group(1).replace('.', ',') + " " + unit, null));
        }
        Matcher abv = ABV.matcher(name);
        if (abv.find()) {
            specs.add(spec("Крепость", abv.group(1).replace('.', ',') + " %", null));
        }
        if (product.hasNonNull("category")) {
            specs.add(spec("Категория", text(product.get("category")), null));
        }
        String description = text(product.get("description"));
        if (!description.isBlank()) {
            specs.add(spec("Описание", description, null));
        }
        return specs;
    }

    private Map<String, Object> spec(String label, String value, String note) {
        Map<String, Object> spec = new LinkedHashMap<>();
        spec.put("label", label);
        spec.put("value", value);
        if (note != null) spec.put("note", note);
        return spec;
    }

    private String style(String lower) {
        if (lower.contains("безалкоголь")) return "Безалкогольное пиво";
        if (lower.contains("гейзер") || lower.contains("gose")) return "Гейзер (Gose)";
        if (lower.contains("ipa")) return "IPA — India Pale Ale";
        if (lower.contains("стаут")) return "Стаут";
        if (lower.contains("портер")) return "Портер";
        if (lower.contains("пшенич")) return "Пшеничное пиво";
        if (lower.contains("лагер")) return "Лагер";
        if (lower.contains("эль")) return "Эль";
        if (lower.contains("кисл")) return "Кислое пиво";
        if (lower.contains("фрукт") || lower.contains("ягод")) return "Фруктовое пиво";
        if (lower.contains("тёмн") || lower.contains("темн")) return "Тёмное пиво";
        if (lower.contains("светл")) return "Светлое пиво";
        return "Классическое пиво";
    }

    private String composition(String lower) {
        String composition = "Вода, солод ячменный, хмель, дрожжи";
        if (lower.contains("пшенич")) composition = "Вода, солод ячменный и пшеничный, хмель, дрожжи";
        if (lower.contains("кофе")) composition = "Вода, солод, хмель, кофе, дрожжи";
        if (lower.contains("шоколад") || lower.contains("какао")) composition = "Вода, солод, хмель, какао, дрожжи";
        if (lower.contains("фрукт") || lower.contains("ягод") || lower.contains("манг") || lower.contains("вишн")) {
            composition = "Вода, солод, хмель, фруктовое пюре, дрожжи";
        }
        if (lower.contains("безалкоголь")) composition += " (менее 0,5% алкоголя)";
        return composition;
    }

    // ------------------------------------------------------------------ profile

    public Map<String, Object> profile(Long customerId) {
        String id = String.valueOf(customerId);

        FetchResult customer = fetchFirstJson(crmUrl, List.of("/api/customers/" + id));
        FetchResult loyalty = fetchFirstJson(loyaltyUrl, loyaltyPaths(id));
        FetchResult favorites = fetchFirstJson(favoritesUrl, favoritePaths(id));
        FetchResult orders = fetchFirstJson(ordersUrl, List.of("/api/orders/customer/" + id));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("customerId", customerId);
        result.put("customer", block(customer.data(), customer.error()));
        result.put("loyalty", block(loyalty.data(), loyalty.error()));
        result.put("favorites", block(favoriteIds(favorites.data()), favorites.error()));
        result.put("orders", block(lastOrders(orders.data()), orders.error()));
        result.put("timestamp", Instant.now().toString());
        return result;
    }

    private Map<String, Object> block(Object data, String error) {
        Map<String, Object> block = new LinkedHashMap<>();
        block.put("data", data);
        block.put("error", error);
        return block;
    }

    private Object favoriteIds(JsonNode data) {
        List<Object> ids = new ArrayList<>();
        JsonNode source = data;
        if (data != null && data.isObject()) {
            source = firstArray(data, "productIds", "favorites", "items", "products", "ids");
        }
        if (source == null || !source.isArray()) return ids;

        for (JsonNode item : source) {
            JsonNode value = item;
            if (item.isObject()) {
                value = firstNode(item, "productId", "id", "product");
                if (value != null && value.isObject()) value = firstNode(value, "id", "productId");
            }
            if (value == null || value.isNull()) continue;
            ids.add(value.isNumber() ? value.numberValue() : value.asText());
        }
        return ids;
    }

    private List<JsonNode> lastOrders(JsonNode data) {
        List<JsonNode> orders = asArray(data);
        if (orders.isEmpty()) return orders;

        boolean hasIds = orders.stream().anyMatch(o -> o.hasNonNull("id") && o.get("id").isNumber());
        if (hasIds) {
            orders.sort((a, b) -> Long.compare(
                    b.hasNonNull("id") ? b.get("id").asLong() : 0L,
                    a.hasNonNull("id") ? a.get("id").asLong() : 0L));
        } else {
            Collections.reverse(orders);
        }
        return new ArrayList<>(orders.subList(0, Math.min(ORDERS_IN_PROFILE, orders.size())));
    }

    // ----------------------------------------------------------------- favorites

    public Object addFavorite(Long customerId, JsonNode body) {
        JsonNode productIdNode = body == null ? null : body.get("productId");
        if (productIdNode == null || productIdNode.isNull() || productIdNode.asText().isBlank()) {
            throw new IllegalArgumentException("Укажите productId");
        }
        Object productId = productIdNode.isNumber() ? productIdNode.numberValue() : productIdNode.asText();
        Map<String, Object> payload = Map.of("productId", productId);

        String path = "/api/favorites/" + customerId;
        String fallback = "/api/favorites/customer/" + customerId;
        JsonNode response = writeFirst(favoritesUrl, List.of(path, fallback), HttpMethod.POST, payload,
                "Не удалось добавить товар в избранное");
        return response != null ? response
                : Map.of("success", true, "message", "Товар добавлен в избранное");
    }

    public Object removeFavorite(Long customerId, Long productId) {
        String path = "/api/favorites/" + customerId + "/" + productId;
        String fallback = "/api/favorites/customer/" + customerId + "/" + productId;
        JsonNode response = writeFirst(favoritesUrl, List.of(path, fallback), HttpMethod.DELETE, null,
                "Не удалось удалить товар из избранного");
        return response != null ? response
                : Map.of("success", true, "message", "Товар удалён из избранного");
    }

    // -------------------------------------------------------------------- events

    public Map<String, Object> sendEvent(JsonNode body) {
        Map<String, Object> payload = new LinkedHashMap<>();
        if (body != null && body.isObject()) {
            body.properties().forEach(entry -> payload.put(entry.getKey(), entry.getValue()));
        }
        payload.putIfAbsent("source", "mobile");
        payload.putIfAbsent("occurredAt", Instant.now().toString());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("delivered", false);

        for (String path : List.of("/api/analytics/events", "/api/events")) {
            try {
                restTemplate.postForObject(analyticsUrl + path, payload, JsonNode.class);
                result.put("delivered", true);
                result.put("message", "Событие отправлено в аналитику");
                return result;
            } catch (Exception ex) {
                log.warn("Не удалось отправить событие в аналитику: {}", path, ex);
            }
        }

        // Аналитика не должна ломать клиент: событие считаем принятым локально.
        result.put("message", "Событие принято. Аналитика временно недоступна");
        result.put("error", "Сервис аналитики недоступен");
        return result;
    }

    // -------------------------------------------------------------------- orders

    public Map<String, Object> orders(Long customerId) {
        FetchResult result = fetchFirstJson(ordersUrl,
                List.of("/api/orders/customer/" + customerId));
        List<JsonNode> orders = asArray(result.data());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("customerId", customerId);
        response.put("orders", orders);
        response.put("total", orders.size());
        response.put("timestamp", Instant.now().toString());
        if (result.error() != null) {
            response.put("error", result.error());
        }
        return response;
    }

    // ------------------------------------------------------------------- helpers

    private List<String> loyaltyPaths(String customerId) {
        return List.of(
                "/api/loyalty/accounts/" + encode(customerId),
                "/api/loyalty/customers/" + encode(customerId),
                "/api/loyalty/" + encode(customerId));
    }

    private List<String> favoritePaths(String customerId) {
        return List.of(
                "/api/favorites/" + encode(customerId),
                "/api/favorites/customer/" + encode(customerId),
                "/api/favorites/ids/" + encode(customerId));
    }

    private FetchResult fetchFirstJson(String baseUrl, List<String> paths) {
        String lastError = null;
        for (String path : paths) {
            String url = baseUrl + path;
            try {
                JsonNode data = restTemplate.getForObject(url, JsonNode.class);
                if (data != null) return new FetchResult(data, null);
            } catch (HttpClientErrorException.NotFound ex) {
                // Сервис доступен, но данных нет — это не ошибка для агрегированного ответа.
                log.debug("Данные не найдены: {}", url);
            } catch (RestClientException ex) {
                lastError = errorText(ex);
                log.warn("Не удалось получить данные: {}", url, ex);
            }
        }
        return new FetchResult(null, lastError);
    }

    private JsonNode writeFirst(String baseUrl, List<String> paths, HttpMethod method,
                                Object payload, String errorMessage) {
        String lastError = null;
        for (String path : paths) {
            String url = baseUrl + path;
            try {
                if (method == HttpMethod.DELETE) {
                    return restTemplate.exchange(url, HttpMethod.DELETE, HttpEntity.EMPTY, JsonNode.class).getBody();
                }
                return restTemplate.postForObject(url, payload, JsonNode.class);
            } catch (HttpClientErrorException.NotFound ex) {
                lastError = "Сервис избранного не поддерживает этот адрес";
            } catch (HttpStatusCodeException ex) {
                throw new ResponseStatusException(
                        HttpStatus.valueOf(ex.getStatusCode().value()),
                        ex.getStatusCode().value() == 409
                                ? "Товар уже в избранном"
                                : "Ошибка сервиса избранного");
            } catch (RestClientException ex) {
                lastError = errorText(ex);
                log.warn("Не удалось выполнить запрос: {}", url, ex);
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                errorMessage + ". " + (lastError == null ? "Сервис недоступен" : lastError));
    }

    private String errorText(Exception ex) {
        if (ex instanceof HttpStatusCodeException statusEx) {
            return "Сервис вернул ошибку " + statusEx.getStatusCode().value();
        }
        if (ex instanceof RestClientException) {
            return "Сервис временно недоступен";
        }
        String message = ex.getMessage();
        if (message == null || message.isBlank()) return "Не удалось получить данные";
        return message.length() > 160 ? message.substring(0, 160) : message;
    }

    private Map<String, Object> mobileProduct(JsonNode product) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", product.hasNonNull("id") && product.get("id").isNumber()
                ? product.get("id").numberValue() : textOrNull(product.get("id")));
        result.put("name", text(product.get("name")));
        result.put("category", text(product.get("category")));
        result.put("description", text(product.get("description")));
        result.put("price", product.hasNonNull("price") ? product.get("price").asText() : null);
        result.put("stockQuantity", product.hasNonNull("stockQuantity") ? product.get("stockQuantity").asInt() : 0);
        result.put("inStock", inStock(product));
        return result;
    }

    private boolean inStock(JsonNode product) {
        return product != null && product.hasNonNull("stockQuantity")
                && product.get("stockQuantity").asInt() > 0;
    }

    private String text(JsonNode node) {
        return node == null || node.isNull() ? "" : node.asText();
    }

    private String textOrNull(JsonNode node) {
        return node == null || node.isNull() ? null : node.asText();
    }

    private String firstText(JsonNode node, String... fields) {
        JsonNode value = firstNode(node, fields);
        return value == null || value.isNull() ? null : value.asText();
    }

    private JsonNode firstNode(JsonNode node, String... fields) {
        if (node == null || !node.isObject()) return null;
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value != null && !value.isNull()) return value;
        }
        return null;
    }

    private JsonNode firstArray(JsonNode node, String... fields) {
        JsonNode value = firstNode(node, fields);
        return value != null && value.isArray() ? value : null;
    }

    private List<JsonNode> asArray(JsonNode node) {
        List<JsonNode> result = new ArrayList<>();
        if (node == null || node.isNull()) return result;
        if (node.isArray()) node.forEach(result::add);
        else result.add(node);
        return result;
    }

    private List<String> asStrings(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node == null || !node.isArray()) return result;
        for (JsonNode item : node) {
            if (item.isTextual()) {
                result.add(item.asText());
            } else {
                String value = firstText(item, "name", "category", "title");
                if (value != null) result.add(value);
            }
        }
        return result;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record FetchResult(JsonNode data, String error) {
    }
}
