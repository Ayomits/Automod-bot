FROM node:24.4-alpine3.21

RUN apk add runit

WORKDIR /app

RUN npm install -g pnpm

RUN mkdir -p /etc/service/app /runit
COPY ./docker/runit/client/dev.run /etc/service/app/run
COPY ./docker/runit/client/dev.sh /runit/dev.sh
RUN chmod +x /etc/service/app/run /runit/dev.sh

COPY ./client ./

CMD ["runsvdir", "/etc/service"]
