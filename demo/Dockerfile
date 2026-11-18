FROM node:20-alpine
WORKDIR /app
COPY server.js products.json index.html ./
ENV PORT=7860
EXPOSE 7860
CMD ["node", "server.js"]
