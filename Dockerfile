FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html svelte.config.js vite.config.js jsconfig.json ./
COPY src ./src
COPY public ./public

ARG API_HOST=http://127.0.0.1:3333
ENV API_HOST=$API_HOST

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/99-app-config.sh /docker-entrypoint.d/99-app-config.sh
RUN chmod +x /docker-entrypoint.d/99-app-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
