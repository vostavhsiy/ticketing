FROM node:20-alpine AS runtime

WORKDIR /app

COPY ./package.json .
RUN npm install
COPY ./dist .


ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "main.js"]
