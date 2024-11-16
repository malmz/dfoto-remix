FROM node:22.1.0-alpine AS base
ENV NODE_ENV=production

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

FROM deps AS prod-deps
WORKDIR /app

RUN npm prune --omit=dev

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM base

WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

CMD ["npm", "start"]