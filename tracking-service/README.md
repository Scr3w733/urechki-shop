# tracking-service — отслеживание доставки

Spring Boot-микросервис сайта и мобильного приложения «У Речушки».
Хранит отправления (shipments) и историю событий по ним (tracking events), отдаёт статус,
прогресс и человекочитаемую подпись статуса.

## Что сервис делает, а чего нет

- Умеет: создать отправление по `orderId` (повторный запрос ничего не дублирует), читать
  историю событий, менять статус и получать список отправлений клиента.
- Не умеет (пока): узнавать реальное местоположение курьера, получать статусы из систем
  доставки, проверять, что заказ и клиент существуют в `order-service`/`crm-service`.
  `orderId` и `customerId` просто сохраняются как переданы вызывающей стороной.
- `eta` при создании — ориентир «через 2 дня», а не расчёт по маршруту или обещание часа доставки.
- Статусы приходят через `PATCH` от оператора или другого сервиса. Сам сервис их не угадывает.
- `progressPercent` — условная шкала для интерфейса, а не процент пройденного пути.
- CORS открыт для всех источников — это учебное демо с локальным фронтендом и мобильным приложением.
- Сервис **подключён** к общему `docker-compose.yml` и поднимается вместе со всем стеком.

## Технологии и запуск

Spring Boot 4.1.2, Java 25, Spring WebMVC, Spring Data JPA, PostgreSQL, Lombok.
Порт по умолчанию — **8087**, база — та же `urechki_main`, что и у других сервисов.

Переменные окружения (если не заданы, используются значения по умолчанию из
`application.properties`):

| Переменная | Значение по умолчанию |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/urechki_main` |
| `SPRING_DATASOURCE_USERNAME` | `admin` |
| `SPRING_DATASOURCE_PASSWORD` | `password` |

Через Docker (рекомендуемый способ):

```powershell
docker compose up -d --build tracking-service
curl http://localhost/api/tracking/health
```

Локально (нужен доступный PostgreSQL; адрес `db` заменяется на свой):

```bash
cd tracking-service
mvn spring-boot:run
```

Таблицы `shipments` и `tracking_events` создаются/обновляются автоматически
(`spring.jpa.hibernate.ddl-auto=update`).

## API

Базовый путь: `/api/tracking`. Ответы об ошибках — JSON:
`timestamp`, `status`, `error`, `message` (сообщения на русском).

### `GET /api/tracking/health`

Проверка, что приложение отвечает.

```json
{ "status": "UP", "service": "tracking-service", "port": 8087 }
```

### `POST /api/tracking/shipments`

Создаёт отправление. Идемпотентно по `orderId`: если такое отправление уже есть,
возвращается оно (HTTP 200) без изменения статуса и истории.

Тело:

```json
{
  "orderId": 42,
  "customerId": 7,
  "address": "ул. Примерная, 1",
  "courier": "Иван"
}
```

`orderId`, `customerId`, `address` — обязательны; `courier` — необязателен, по умолчанию
«Курьер У Речушки». Новое отправление получает статус «Собирается», `eta = сейчас + 2 дня`
и первое событие «Отправление зарегистрировано».

Ответ: объект `Shipment` (201 при создании, 200 если уже был).

### `GET /api/tracking/shipments/{orderId}`

Возвращает `TrackingView`:

```json
{
  "shipment": {
    "id": 1,
    "orderId": 42,
    "customerId": 7,
    "status": "В пути",
    "courier": "Курьер У Речушки",
    "address": "ул. Примерная, 1",
    "eta": "2026-11-20T12:00:00",
    "createdAt": "2026-11-18T12:00:00",
    "updatedAt": "2026-11-18T15:00:00"
  },
  "events": [
    {
      "id": 3,
      "shipmentId": 1,
      "status": "В пути",
      "note": "Выехал со склада",
      "location": "Склад",
      "createdAt": "2026-11-18T15:00:00"
    }
  ],
  "progressPercent": 65,
  "humanStatus": "Курьер в пути"
}
```

События отсортированы от новых к старым. Если отправление не найдено — 404.

### `PATCH /api/tracking/shipments/{orderId}/status`

Добавляет событие и меняет текущий статус отправления.

Тело:

```json
{
  "status": "В пути",
  "note": "Выехал со склада",
  "location": "Склад"
}
```

`status` — обязателен; `note` и `location` — необязательны. Неизвестный статус → 400
с перечислением допустимых значений. Ответ — тот же `TrackingView`, что у GET.

### `GET /api/tracking/customer/{customerId}`

Все отправления клиента, сначала новые. Возвращает список объектов `Shipment`
(пустой список, если отправлений нет).

```bash
curl -X POST http://localhost:8087/api/tracking/shipments \
  -H 'Content-Type: application/json' \
  -d '{"orderId":42,"customerId":7,"address":"ул. Примерная, 1"}'

curl -X PATCH http://localhost:8087/api/tracking/shipments/42/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"В пути","note":"Курьер выехал"}'

curl http://localhost:8087/api/tracking/shipments/42
curl http://localhost:8087/api/tracking/customer/7
```

## Статусы и шкала прогресса

| Статус | `progressPercent` | `humanStatus` |
|---|---:|---|
| Собирается | 10 | Собираем заказ |
| Передан в доставку | 35 | Заказ передан курьеру |
| В пути | 65 | Курьер в пути |
| Доставлен | 100 | Заказ доставлен |
| Отменён | 0 | Заказ отменён |

Статус хранится строкой; любое другое значение через API отклоняется (400).
