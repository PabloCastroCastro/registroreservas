FROM node:lts-alpine as build

WORKDIR /front

COPY package.json /front/package.json
COPY package-lock.json /front/package-lock.json
RUN npm ci

COPY . /front

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "dev", "build" ]