# mobile-gateway-service

API-слой для React Native приложения «Урёчки». Сервис не хранит данные сам, а агрегирует ответы
остальных микросервисов, возвращая мобильному клиенту удобные JSON-структуры.

**Порт:** `8090` · **Базовый путь:** `/api/mobile` · **Пакет:** `com.urechki.mobile_gateway`

> Сервис **подключён** к общему `docker-compose.yml`, и мобильное приложение использует именно его.
> Все запросы приложения идут через nginx сайта (`/api/mobile/*`).

## Технологии

- Spring Boot 4.1.2, Java 25, `spring-boot-starter-webmvc`
- `httpclient5` + `HttpComponentsClientHttpRequestFactory` (поддерживает PATCH и таймауты)
- Lombok, Jackson `JsonNode`/`Map` вместо жёстких DTO нижестоящих сервисов

Таймауты RestTemplate: подключение — 2 с, получение ответа — 3 с, ожидание соединения из пула — 2 с.

## Сборка и запуск

Через Docker (рекомендуемый способ):

```powershell
docker compose up -d --build mobile-gateway-service
curl http://localhost/api/mobile/health
```

Локально:

```powershell
cd mobile-gateway-service
mvn -B -ntp package
java -jar target/mobile-gateway-service-0.0.1-SNAPSHOT.jar
curl http://localhost:8090/api/mobile/health
```

> Исправление: параметры запроса (`category`, `search`) кодируются один раз. Раньше двойное URL-encoding
> ломало поиск по кириллице; сейчас `/api/mobile/catalog?search=IPA` и поиск по русским названиям
> возвращают корректные `products` и `total`.

## Эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/mobile/health` | Статус шлюза: `status=ok`, сообщение и время. |
| GET | `/api/mobile/home?customerId=1` | Главный экран: `hero` (Russian copy), `categories` из каталога, `featuredProducts` (первые 8 товаров в наличии), `loyaltyTeaser`, `features`, `timestamp`. Без `customerId` в тизере вызывающий попадает в приложение. |
| GET | `/api/mobile/catalog?category=Пиво&search=IPA&limit=20` | Каталог. Возвращает `{products, total, categories, category, search, limit}`; `limit` 1..100, по умолчанию 20. |
| GET | `/api/mobile/product/{id}` | Товар плюс `inStock`, `badges` и `specs` (состав, стиль, объём, крепость), выведенные из названия. 404, если товара нет. |
| GET | `/api/mobile/profile/{customerId}` | Профиль: блоки `customer` (CRM), `loyalty`, `favorites` (id товаров), `orders` (последние 5 заказов). Каждый блок имеет поля `data` и `error`; при падении любого downstream-сервиса HTTP остаётся 200. |
| POST | `/api/mobile/favorites/{customerId}` | Добавление в избранное. Тело: `{"productId": 12}`. |
| DELETE | `/api/mobile/favorites/{customerId}/{productId}` | Удаление из избранного. |
| POST | `/api/mobile/events` | Отправка события в аналитику. Клиенту всегда возвращается 200: при недоступности аналитики `delivered=false` и русское сообщение. |
| GET | `/api/mobile/orders/{customerId}` | Заказы клиента: `{customerId, orders, total, timestamp}`. При недоступности order-service — пустой список и поле `error`. |

### Пример ответа `/home` (сокращённо)

```json
{
  "hero": {
    "badge": "Доставка по городу",
    "title": "Любимое пиво — всегда под рукой",
    "subtitle": "Свежие сорта, бонусы за каждый заказ и избранное в одном приложении",
    "primaryButton": "Перейти в каталог",
    "secondaryButton": "Мои заказы"
  },
  "categories": ["Пиво", "Слабоалкогольные"],
  "featuredProducts": [{ "id": 1, "name": "Пиво IPA", "inStock": true, "price": "199.00" }],
  "loyaltyTeaser": {
    "available": true,
    "title": "Уровень Постоянный",
    "message": "У вас 340 бонусов — оплачивайте ими заказы",
    "points": "340",
    "tier": "Постоянный",
    "error": null
  },
  "features": [{ "id": "catalog", "title": "Каталог", "description": "Сотни сортов с поиском и фильтрами" }]
}
```

### Пример ответа `/profile/{customerId}` при недоступности loyalty

```json
{
  "customerId": 1,
  "customer": { "data": { "id": 1, "name": "Иван" }, "error": null },
  "loyalty": { "data": null, "error": "Сервис временно недоступен" },
  "favorites": { "data": [3, 7], "error": null },
  "orders": { "data": [{ "id": 42, "status": "Оплачен" }], "error": null }
}
```

## Переменные окружения

| Переменная | Значение по умолчанию | Назначение |
|---|---|---|
| `APP_SERVICES_CATALOG` | `http://catalog-service:8080` | Каталог товаров (`/api/products`, `/api/products/categories`). |
| `APP_SERVICES_CRM` | `http://crm-service:8081` | Профиль клиента (`/api/customers/{id}`). |
| `APP_SERVICES_ORDERS` | `http://order-service:8082` | Заказы (`/api/orders/customer/{id}`). |
| `APP_SERVICES_LOYALTY` | `http://loyalty-service:8086` | Бонусы/уровни: `GET /api/loyalty/accounts/{customerId}`. |
| `APP_SERVICES_TRACKING` | `http://tracking-service:8087` | Статусы доставки (зарезервировано для будущих эндпоинтов). |
| `APP_SERVICES_FAVORITES` | `http://favorites-service:8088` | Избранное: `GET/POST /api/favorites/{customerId}`, `DELETE /api/favorites/{customerId}/{productId}`. |
| `APP_SERVICES_NOTIFICATIONS` | `http://notification-service:8084` | Уведомления (зарезервировано для будущих эндпоинтов). |
| `APP_SERVICES_ANALYTICS` | `http://analytics-service:8089` | События: `POST /api/analytics/events` (для совместимости также `/api/events`). |

Шлюз также перебирает запасные пути для лояльности (`/api/loyalty/customers/{id}`, `/api/loyalty/{id}`) и
избранного (`/api/favorites/customer/{id}`, `/api/favorites/ids/{id}`), поэтому изменение схемы этих сервисов
не потребует правок мобильного приложения.

## Отказоустойчивость и ошибки

- `/home` и `/profile/{id}` всегда возвращают HTTP 200: если нижестоящий сервис недоступен, соответствующий
  блок содержит `error` с понятным русским текстом, остальные данные остаются заполненными.
- `/events` никогда не возвращает ошибку из-за недоступной аналитики — событие помечается принятым локально
  (`delivered=false`, `error` в теле).
- Для лояльности, избранного и аналитики шлюз перебирает несколько типичных путей, поэтому точная схема этих
  сервисов может измениться без правок мобильного приложения.
- CORS разрешён для всех origin и методов `GET/POST/PUT/PATCH/DELETE/OPTIONS`.
- Ошибки валидации и запросов — JSON вида
  `{"timestamp", "status", "error", "message", "path"}`; стек-трейсы клиенту не отдаются.
