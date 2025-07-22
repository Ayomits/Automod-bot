FROM node:24-alpine as base

RUN npm install -g pnpm

FROM base as prod

RUN pnpm install --frozen-lockfile
RUN pnpm run build

CMD ["pnpm", "run", "prod"]

FROM base as dev

RUN pnpm install

CMD ["pnpm", "run", "dev"]
