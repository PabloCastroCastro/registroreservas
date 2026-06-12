FROM node:current-alpine3.20

RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-spa

# Create app directory
WORKDIR /server

COPY package.json /server/package.json
COPY package-lock.json /server/package-lock.json
RUN npm ci

COPY . /server

# Tessdata OCRB: modelo entrenado para fuente OCR-B usada en MRZ de documentos de identidad.
# Fichero descargado de https://github.com/Shreeshrii/tessdata_ocrb
COPY tessdata/ocrb.traineddata /usr/share/tessdata/ocrb.traineddata

EXPOSE 3003
