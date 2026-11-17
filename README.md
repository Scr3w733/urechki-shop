# Urechki Shop

Интернет-магазин пива: React-фронтенд, 5 Spring Boot сервисов, PostgreSQL и Redis.

## Быстрый запуск (рекомендуемый)

Нужно только установить и запустить **Docker Desktop**. Java, Maven и Node локально устанавливать не нужно — всё соберётся внутри Docker.

В терминале в корне проекта (`D:\urechki-shop`):

```powershell
docker compose up --build
```

Подождите, пока все сервисы напишут `Started ...` и станут `healthy`. После этого откройте сайт:

```
http://localhost/
```

Если хотите запустить в фоне (без вывода логов в терминале):

```powershell
docker compose up -d --build
docker compose ps
```

## Полезные команды

```powershell
docker compose logs -f              # все логи
docker compose logs -f catalog-service crm-service order-service  # логи нужных сервисов
docker compose down                 # остановить (данные БД сохраняются)
docker compose down -v              # остановить и удалить данные БД (при следующем старте товары загрузятся заново)
docker compose restart              # перезапустить контейнеры
```

> Если при первой сборке Maven не смог скачать зависимости из-за обрыва сети, просто повторите `docker compose up --build` — ошибка сетевая, код исправлен и собирается.

## Порты

| Сервис | Адрес |
|---|---|
| Сайт (nginx) | http://localhost/ |
| Каталог | http://localhost:8080/api/products |
| CRM | http://localhost:8081/api/customers |
| Заказы | http://localhost:8082/api/orders |
| Уведомления | http://localhost:8084/api/notifications/send |
| Оплата | http://localhost:8085/api/payments/process |
| Лояльность | http://localhost:8086/api/loyalty/health |
| Отслеживание заказов | http://localhost:8087/api/tracking/health |
| Избранное | http://localhost:8088/api/favorites/health |
| Аналитика | http://localhost:8089/api/analytics/health |
| API для мобильного приложения | http://localhost:8090/api/mobile/health |
| PostgreSQL | localhost:5433 (БД `urechki_main`, пользователь `admin`, пароль `password`) |
| Redis | localhost:6379 |

## Разработка фронтенда без Docker

Бэкенд-сервисы должны быть запущены (например, через `docker compose up -d`), затем:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Откройте http://localhost:5173 . Vite проксирует `/api/...` на нужные сервисы.

## Проверка работы

После запуска можно проверить API:

```powershell
curl http://localhost/api/products
curl http://localhost/api/customers
curl http://localhost/api/orders
```

## Что появилось после улучшений

**Сайт**
- Современная тёмная тема с единой дизайн-системой, адаптивом и аккуратными анимациями.
- Каталог с поиском, категориями, фильтром по цене/налинию, сортировкой, сеткой/списком и быстрым просмотром.
- Карточка товара с характеристиками, похожими товарами и понятными состояниями загрузки.
- Корзина с прогрессом до бесплатной доставки, сохранением между перезагрузками и трёхшаговое оформление заказа.
- Профиль с заказами, избранным, бонусами и редактированием данных.
- Рабочая админка: добавление/редактирование/удаление товаров, управление остатками и статусами заказов.
- Командная строка поиска по сайту (Ctrl/Cmd + K), чат-помощник, уведомления и настройки темы.

**Бэкенд**
- Пароли хешируются; пароль больше никогда не возвращается в API.
- Роль и скидка клиента определяются сервером, подставить «Владелец» при регистрации нельзя.
- Цена заказа считается сервером на основе каталога и скидки клиента — клиент не может прислать свою цену.
- Проверка и резервирование остатков, отмена заказа при неуспешной оплате, возврат товара.
- Поддержка промокодов (`URE4KA`, `BEER5`, `BEER10`, `BEER15`, `CASH500`) и бонусов на сервере.
- Оплата с `BigDecimal`, лимитом, идентификатором транзакции и защитой от повторного списания.
- История уведомлений, healthcheck-и и понятные JSON-ошибки вместо 500-х stack trace.
- Новые сервисы: лояльность с уровнями и кэшбэком, отслеживание доставки, синхронное избранное, аналитика событий и единый API для будущего мобильного приложения.
- Локальные SVG-иллюстрации для товаров, главной и превью приложения — работают офлайн и не зависят от генератора картинок.

## Админ-аккаунт и промокоды

Чтобы получить роль «Владелец» (админка `/admin`), зарегистрируйтесь с email:

```
admin@urechki.ru
```

Роль и расширенную скидку назначает сервер по этому адресу (переопределяется переменной `APP_ADMIN_EMAIL` в `docker-compose.yml`).

Промокоды: `URE4KA` (скидка 5%), `BEER5`, `BEER10`, `BEER15`, `CASH500`.

## Основные API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/products?category=&search=&minPrice=&maxPrice=&onlyInStock=&sort=` | Каталог с фильтрами |
| GET | `/api/products/categories` | Список категорий |
| POST/PUT/DELETE | `/api/products`, `/api/products/{id}` | Управление товарами |
| PATCH | `/api/products/{id}/stock` | Изменение остатка `{ "quantity": -1 }` |
| POST | `/api/customers/register`, `/api/customers/login` | Регистрация и вход |
| PUT | `/api/customers/{id}` | Обновление профиля |
| POST | `/api/customers/{id}/bonuses` | Начисление/списание бонусов |
| POST | `/api/orders` | Оформление заказа |
| PATCH | `/api/orders/{id}/status` | Смена статуса |
| GET | `/api/orders/customer/{id}` | Заказы клиента |
| POST | `/api/payments/process` | Оплата (используется заказами) |
| GET | `/api/notifications?email=` | История уведомлений |
| GET | `/api/loyalty/accounts/{customerId}` | Уровень лояльности и баланс баллов |
| POST | `/api/loyalty/quote` | Расчёт кэшбэка и скидки `{ "customerId": 1, "amount": 1000 }` |
| GET | `/api/tracking/shipments/{orderId}` | Статус доставки и история событий |
| GET/POST/DELETE | `/api/favorites/{customerId}` | Синхронное избранное |
| GET | `/api/analytics/summary`, `/api/analytics/funnel` | Метрики и воронка |
| GET | `/api/mobile/home`, `/api/mobile/profile/{id}` | Агрегированные данные для приложения |
