FROM mcr.microsoft.com/playwright:v1.51.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
