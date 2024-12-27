# Етап збірки
FROM node:20-alpine AS builder

# Встановлення додаткових залежностей
RUN apk add --no-cache python3 make g++

# Встановлення глобальних npm пакетів
RUN npm i -g @nestjs/cli typeorm

# Встановлення робочої директорії
WORKDIR /app

# Копіювання конфігураційних файлів
COPY package*.json tsconfig*.json ./

# Встановлення залежностей
RUN npm install

# Копіювання сирцевого коду
COPY . .

# Збірка проекту
RUN npm run build

# Етап продакшн
FROM node:20-alpine AS production

# Встановлення глобальних npm пакетів в production
RUN npm i -g @nestjs/cli typeorm

# Встановлення робочої директорії
WORKDIR /app

# Копіювання конфігураційних файлів
COPY package*.json tsconfig*.json ./
COPY .env* ./

# Встановлення лише production залежностей
RUN npm install --omit=dev

# Копіювання збудованого додатку та міграцій з етапу збірки
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database

# Налаштування змінних середовища
ENV NODE_ENV=production

# Відкриття порту
EXPOSE 3000

# Налаштування перевірки здоров'я
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Запуск додатку
CMD ["node", "dist/main"]