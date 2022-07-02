ARG PROFILE

FROM node:current-alpine3.16

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV = development

RUN npm i

COPY . .

ENV NODE_ENV = $ARG PROFILE
ENV REDIS_CLIENT=redis://redis:6379

RUN npm run build

ENV PORT=4000

EXPOSE 4000
