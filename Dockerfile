FROM node:16 AS server-build

WORKDIR /usr/src/app

COPY . .

RUN yarn install && yarn build

CMD yarn seed:roles && node "./dist/main.js"