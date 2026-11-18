# Облегчённая демо-версия «У Речушки» для бесплатного контейнера.
# Корневой Dockerfile и контекст сборки "." — чтобы хостинг не путал пути.
FROM node:20-alpine
WORKDIR /app
COPY demo/server.js demo/products.json demo/index.html ./
ENV PORT=7860
EXPOSE 7860
CMD ["node", "server.js"]
