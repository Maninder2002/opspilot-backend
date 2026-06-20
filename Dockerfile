FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod --frozen-lockfile

COPY . .

RUN mkdir -p src/uploads

EXPOSE 5000

CMD ["pnpm", "start"]