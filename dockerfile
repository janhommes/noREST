FROM node:alpine

RUN mkdir norest
WORKDIR /norest
RUN mkdir data

ADD ./nestjs/norest.config.js /norest
CMD  ["npm", "install", "@norest/cli" "-g"]

CMD  ["norest", "--port=80"]