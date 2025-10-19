FROM node:25-alpine3.21

COPY . .

RUN apk add npm

RUN npm install -g pnpm && pnpm install

CMD ["pnpm", "dev"]