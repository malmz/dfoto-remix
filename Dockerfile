FROM node:22.1.0-alpine as base
ENV NODE_ENV=production

FROM base as deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

FROM deps as prod-deps
WORKDIR /app

RUN npm prune --omit=dev

FROM deps as build
WORKDIR /app
COPY . .
RUN npm run build

FROM base

WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

CMD ["npm", "start"]