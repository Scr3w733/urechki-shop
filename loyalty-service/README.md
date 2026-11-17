# loyalty-service

Микросервис программы лояльности магазина крафтового пива «Урёчки».
Порт: **8086**. База данных: `urechki_main` (общая с остальными сервисами).

## Уровни и бонусы

| Уровень      | Условие получения                          | Кэшбэк | Скидка |
|--------------|--------------------------------------------|--------|--------|
| Новичок      | по умолчанию                               | 3%     | 0%     |
| Постоянный   | покупки от 10 000 ₽ **или** от 5 заказов  | 5%     | 3%     |
| ВИП          | покупки от 30 000 ₽ **или** от 15 заказов | 8%     | 5%     |

Баллы начисляются по правилу `round(сумма × кэшбэк / 100)` (банковское округление).
`pointsToNextLevel` — остаток оборота до порога следующего уровня (1 балл = 1 ₽ оборота),
округлённый вверх; для ВИП равен `0`. Условие по количеству заказов — альтернативный
путь повышения, поэтому отображаемый остаток ориентирован на сумму покупок.

## Переменные окружения

| Переменная                | Значение по умолчанию                        |
|---------------------------|----------------------------------------------|
| `SPRING_DATASOURCE_URL`   | `jdbc:postgresql://db:5432/urechki_main`     |
| `SPRING_DATASOURCE_USERNAME` | `admin`                                   |
| `SPRING_DATASOURCE_PASSWORD` | `password`                                |

Схема таблиц `loyalty_accounts` и `loyalty_transactions` создаётся/обновляется автоматически
(`spring.jpa.hibernate.ddl-auto=update`).

## Endpoints

| Метод | Путь                                  | Описание                                                   |
|-------|---------------------------------------|------------------------------------------------------------|
| GET   | `/api/loyalty/health`                 | `{"status":"UP","service":"loyalty-service"}`              |
| GET   | `/api/loyalty/accounts/{customerId}`  | Счёт клиента; создаётся со уровнем «Новичок», если его нет  |
| POST  | `/api/loyalty/quote`                  | Расчёт кэшбэка, скидки и баллов по сумме покупки            |
| POST  | `/api/loyalty/accrue`                 | Начисление баллов за заказ (идемпотентно по `orderId`)      |
| GET   | `/api/loyalty/history/{customerId}`   | Последние 50 транзакций клиента                             |

### Примеры запросов

```bash
curl http://localhost:8086/api/loyalty/health

curl http://localhost:8086/api/loyalty/accounts/1

curl -X POST http://localhost:8086/api/loyalty/quote \
  -H 'Content-Type: application/json' \
  -d '{"customerId":1,"amount":1200}'

curl -X POST http://localhost:8086/api/loyalty/accrue \
  -H 'Content-Type: application/json' \
  -d '{"customerId":1,"orderId":42,"amount":1200}'

curl http://localhost:8086/api/loyalty/history/1
```

Повторный вызов `/accrue` с тем же `orderId` возвращает текущий счёт без повторного
начисления и без добавления записи в историю.

## Ошибки

Ошибки возвращаются в JSON без стека вызовов:

```json
{
  "timestamp": "2026-11-18T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Укажите сумму покупки"
}
```

## Сборка и запуск

```bash
./mvnw clean package
java -jar target/loyalty-service-0.0.1-SNAPSHOT.jar
```

Или через Docker:

```bash
docker build -t loyalty-service .
docker run -p 8086:8086 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/urechki_main \
  -e SPRING_DATASOURCE_USERNAME=admin \
  -e SPRING_DATASOURCE_PASSWORD=password \
  loyalty-service
```

CORS разрешён для всех источников (`@CrossOrigin` на контроллере и глобальный
`CorsConfig`).
