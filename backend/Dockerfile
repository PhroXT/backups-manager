FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN apk add --no-cache docker-cli

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/main"]
