FROM node:current-alpine3.20

# Create app directory
WORKDIR /server

COPY package.json /server/package.json
COPY package-lock.json /server/package-lock.json
RUN npm ci

COPY . /server

EXPOSE 3003