# Общий образ для Hugging Face Spaces: весь стек в одном контейнере.
FROM maven:3.9-eclipse-temurin-17 AS java-build
WORKDIR /build
COPY . .
RUN for svc in catalog-service crm-service payment-service order-service notification-service loyalty-service tracking-service favorites-service analytics-service mobile-gateway-service; do \
      mvn -B -ntp -q -f "/build/$svc/pom.xml" -Dmaven.test.skip=true package || exit 1; \
    done
RUN mkdir -p /out && for svc in catalog-service crm-service payment-service order-service notification-service loyalty-service tracking-service favorites-service analytics-service mobile-gateway-service; do \
      cp "/build/$svc/target/"*.jar "/out/$svc.jar"; \
    done

FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM eclipse-temurin:17-jre
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      nginx postgresql redis-server supervisor gettext-base curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=java-build /out /app/services
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY frontend/nginx-hf.conf.template /etc/nginx/templates/default.conf.template
COPY db/00-schema.sql /app/db/00-schema.sql
COPY products.sql /app/db/products.sql
COPY deploy/hfspace/start.sh /app/start.sh
COPY deploy/hfspace/supervisord.conf /etc/supervisor/conf.d/urechki.conf
RUN chmod +x /app/start.sh

ENV PORT=7860
EXPOSE 7860
CMD ["/app/start.sh"]
