FROM node:24.4-alpine3.21

WORKDIR /app

RUN npm install -g pnpm

COPY ./client .

CMD sh entrypoint.sh
