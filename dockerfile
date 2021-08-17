FROM node:alpine

RUN mkdir norest
WORKDIR /norest
RUN mkdir data

ADD . /norest
COPY ./nestjs/norest.config.js ./norest.config.js

CMD  ["npx", "norest", "--port=80"]