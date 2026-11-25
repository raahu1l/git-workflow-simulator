FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    docker.io \
    python3 \
    make \
    g++ \
    bash \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci

COPY apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["npm", "start"]