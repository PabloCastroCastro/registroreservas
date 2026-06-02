FROM node:lts-alpine as build

ARG NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_HOST=$NEXT_PUBLIC_API_HOST

WORKDIR /front

COPY package.json /front/package.json
COPY package-lock.json /front/package-lock.json
RUN npm ci

COPY . /front

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "dev", "build" ]