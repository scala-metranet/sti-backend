FROM node:18-alpine3.16
RUN apk add g++ make py3-pip
RUN npm install -g pnpm

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . ./app

WORKDIR /app

RUN npm install
EXPOSE 80

CMD ["pnpm","dev"]

