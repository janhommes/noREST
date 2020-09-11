FROM node:alpine

RUN mkdir norest
WORKDIR /norest

ADD . /norest
COPY ./nestjs/norest.config.js ./norest.config.js

CMD  ["npx", "norest"]