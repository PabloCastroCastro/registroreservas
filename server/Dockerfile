FROM node:current-alpine3.20

RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-spa

# Create app directory
WORKDIR /server

COPY package.json /server/package.json
COPY package-lock.json /server/package-lock.json
RUN npm ci

COPY . /server

EXPOSE 3003
