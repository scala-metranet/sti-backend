# Dockerfile.dev (Development)
FROM node:18-alpine3.16
RUN apk add --no-cache g++ make py3-pip
RUN npm install -g pnpm

WORKDIR /app
COPY . .

RUN pnpm install

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "dev:local"]