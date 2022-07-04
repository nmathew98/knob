ARG PROFILE

FROM node:current-alpine3.16

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development

RUN npm i

COPY . .

ENV NODE_ENV = $ARG PROFILE

RUN npm run build

ENV PORT=3000

EXPOSE 3000
