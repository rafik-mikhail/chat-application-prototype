FROM node:alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:alpine AS deploy

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install --prod

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main"]