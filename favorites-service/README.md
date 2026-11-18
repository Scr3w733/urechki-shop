# favorites-service

Микросервис избранного для сайта и мобильного приложения «Урёчки».
Хранит привязку `клиент -> товар` в PostgreSQL и позволяет синхронизировать
весь список избранного одной операцией.

- Порт: **8088**
- Базовый путь API: `/api/favorites`
- Java 25, Spring Boot 4.1.2, Spring WebMVC + Spring Data JPA, PostgreSQL, Lombok
- Схема БД создаётся/обновляется автоматически (`spring.jpa.hibernate.ddl-auto=update`)

## Запуск

Сервис **уже подключён** к общему `docker-compose.yml`:

```powershell
docker compose up -d --build favorites-service
```

Проверка через общий nginx: `curl http://localhost/api/favorites/health`.

Внутри Docker-сети используются значения по умолчанию
`jdbc:postgresql://db:5432/urechki_main`, пользователь `admin`, пароль `password`.
Они переопределяются переменными `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

Для локального запуска без Compose:

```powershell
cd favorites-service
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/urechki_main"
$env:SPRING_DATASOURCE_USERNAME="admin"
$env:SPRING_DATASOURCE_PASSWORD="password"
mvn spring-boot:run
```

## API

| Метод | Путь | Тело | Ответ | Описание |
|---|---|---|---|---|
| GET | `/api/favorites/health` | — | `{"status":"ok","service":"favorites-service"}` | Проверка жизни |
| GET | `/api/favorites/{customerId}` | — | `[12, 34, 56]` | productId клиента в порядке добавления |
| POST | `/api/favorites/{customerId}` | `{"productId": 12}` | объект `Favorite` | Добавить в избранное (идемпотентно) |
| DELETE | `/api/favorites/{customerId}/{productId}` | — | `{"removed": true}` | Удалить из избранного (идемпотентно) |
| POST | `/api/favorites/{customerId}/sync` | `{"productIds":[12,34]}` | `[12, 34]` | Атомарно заменить весь список |
| GET | `/api/favorites/{customerId}/count` | — | `2` | Количество товаров в избранном |

### Синхронизация (site <-> app)

`POST /{customerId}/sync` — единственный источник истины для полного списка:

- выполняется в одной транзакции: лишние записи удаляются, недостающие создаются;
- повторы в `productIds` отбрасываются, `null` игнорируются;
- пустой список очищает избранное;
- уникальность пары `(customer_id, product_id)` гарантирована ограничением БД,
  поэтому параллельные `POST /{customerId}` не создадут дублей (конфликт уникальности
  при гонке приведёт к ошибке запроса, клиент может безопасно повторить операцию).

Пример:

```powershell
curl -X POST http://localhost:8088/api/favorites/1/sync `
  -H "Content-Type: application/json" `
  -d '{"productIds":[12,34,56]}'
```

## Ошибки

Ошибки возвращаются JSON с русскими сообщениями:

```json
{
  "timestamp": "2026-11-18T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Укажите товар (productId)"
}
```

CORS разрешён для всех источников (`*`), в том числе для preflight-запросов.
