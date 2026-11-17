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
