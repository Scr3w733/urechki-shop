-- Схема нужна до запуска Spring, чтобы products.sql можно было применить
-- при первом старте PostgreSQL (docker-entrypoint-initdb.d).
SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(255),
    price NUMERIC(38, 2),
    stock_quantity INTEGER,
    description TEXT
);
