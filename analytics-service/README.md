# analytics-service

Микросервис аналитики магазина «Урёчки». Принимает произвольные события с сайта
и считает сводку, воронку и список последних событий **только по сохранённым данным**.
Никаких демонстрационных или выдуманных чисел сервис не подставляет.

- Порт: **8089**
- Базовый путь API: `/api/analytics`
- Java 25, Spring Boot 4.1.2, Spring WebMVC + Spring Data JPA, PostgreSQL, Lombok
- Схема БД создаётся/обновляется автоматически (`spring.jpa.hibernate.ddl-auto=update`)

## Запуск

`docker-compose.yml` в этой задаче не изменяется, поэтому сервис нужно либо добавить
в Compose отдельно, либо запустить локально:

```powershell
cd analytics-service
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/urechki_main"
$env:SPRING_DATASOURCE_USERNAME="admin"
$env:SPRING_DATASOURCE_PASSWORD="password"
mvn spring-boot:run
```

Внутри Docker-сети значения по умолчанию уже подходят:
`jdbc:postgresql://db:5432/urechki_main`, пользователь `admin`, пароль `password`.
Переопределяются переменными `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

Сборка образа (по желанию):

```powershell
docker build -t urechki-analytics-service ./analytics-service
```

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/analytics/health` | Проверка жизни |
| POST | `/api/analytics/events` | Сохранить произвольное событие (любой JSON-объект) |
| GET | `/api/analytics/summary` | Сводка: `events`, `revenue`, `uniqueCustomers`, `topProducts`, `last24hEvents` |
| GET | `/api/analytics/funnel` | Воронка по типам событий с конверсиями |
| GET | `/api/analytics/recent?limit=20` | Последние события (1..100, по умолчанию 20) |

### POST /events

Принимается любой JSON-объект. Все поля необязательны — отсутствующие или
некорректные значения сохраняются как `null` и не вызывают ошибку.

```json
{
  "type": "order_created",
  "customerId": 3,
  "productId": 42,
  "amount": 1290.50,
  "payload": {"source": "site"}
}
```

Распознаются: `type` (также `event`, `eventType`), `customerId`, `productId`,
`amount` (также `total`, `revenue`). Если их нет на верхнем уровне, сервис пробует
взять их из вложенного `payload` (объект или JSON-строка). Полный исходный JSON
всегда сохраняется в поле `payload`.

### GET /summary

```json
{
  "events": 42,
  "revenue": 12900.00,
  "uniqueCustomers": 7,
  "topProducts": {"42": 12, "17": 5},
  "last24hEvents": 9
}
```

- `events` — общее число сохранённых событий;
- `revenue` — сумма **только положительных** `amount` (отрицательные корректировки не вычитаются);
- `uniqueCustomers` — число разных непустых `customerId`;
- `topProducts` — `productId -> количество`, первые 10 по убыванию (учитывается и `productId` внутри `payload`);
- `last24hEvents` — события за последние 24 часа.

### GET /funnel

Этапы воронки с русскими подписями и конверсиями, посчитанными из реальных событий:

```json
{
  "stages": [
    {"key": "view_product", "label": "Просмотр товара", "count": 30,
     "conversionFromPrevious": 100.0, "conversionFromFirst": 100.0},
    {"key": "add_to_cart", "label": "Добавление в корзину", "count": 10,
     "conversionFromPrevious": 33.3, "conversionFromFirst": 33.3}
  ],
  "note": "Счётчики и конверсии рассчитаны только по сохранённым событиям — демонстрационные данные не подставляются."
}
```

Если счётчик предыдущего (или первого) этапа равен нулю, конверсия возвращается `0.0` —
деления на ноль нет. Конверсия выше 100% возможна, если событий позже оказалось больше,
чем на предыдущем этапе: данные не подгоняются под «красивую» воронку.

## Ошибки

Ошибки возвращаются JSON с русскими сообщениями:

```json
{
  "timestamp": "2026-11-18T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Некорректный запрос: проверьте JSON и параметры"
}
```

CORS разрешён для всех источников (`*`), в том числе для preflight-запросов.
