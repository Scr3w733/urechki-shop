#!/bin/bash
set -e

export PORT="${PORT:-7860}"
export SPRING_DATASOURCE_URL='jdbc:postgresql://127.0.0.1:5432/urechki_main'
export SPRING_DATASOURCE_USERNAME='admin'
export SPRING_DATASOURCE_PASSWORD='password'
export SPRING_DATA_REDIS_HOST='127.0.0.1'
export SPRING_DATA_REDIS_PORT='6379'
export APP_ADMIN_EMAIL='admin@urechki.ru'
export APP_SERVICES_CATALOG='http://127.0.0.1:8080'
export APP_SERVICES_CRM='http://127.0.0.1:8081'
export APP_SERVICES_ORDERS='http://127.0.0.1:8082'
export APP_SERVICES_PAYMENT='http://127.0.0.1:8085'
export APP_SERVICES_NOTIFICATION='http://127.0.0.1:8084'
export APP_SERVICES_NOTIFICATIONS='http://127.0.0.1:8084'
export APP_SERVICES_LOYALTY='http://127.0.0.1:8086'
export APP_SERVICES_TRACKING='http://127.0.0.1:8087'
export APP_SERVICES_FAVORITES='http://127.0.0.1:8088'
export APP_SERVICES_ANALYTICS='http://127.0.0.1:8089'

PGVER="$(ls /etc/postgresql | head -n 1)"
pg_ctlcluster "$PGVER" main start || true

su postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='admin'\"" | grep -q 1 || \
  su postgres -c "psql -c \"CREATE USER admin WITH PASSWORD 'password'\""
su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='urechki_main'\"" | grep -q 1 || \
  su postgres -c "createdb -O admin urechki_main"

TABLES="$(su postgres -c "psql -tAc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'\" urechki_main" | tr -d ' ')"
if [ "${TABLES:-0}" -lt 2 ]; then
  su postgres -c "psql -v ON_ERROR_STOP=1 -d urechki_main -f /app/db/00-schema.sql"
  su postgres -c "psql -v ON_ERROR_STOP=1 -d urechki_main -f /app/db/products.sql"
fi

redis-server --daemonize yes

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
