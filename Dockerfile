FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=1000

EXPOSE 1000

CMD ["node", "server.js"]