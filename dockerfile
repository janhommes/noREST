FROM node:14

RUN mkdir norest
WORKDIR /norest
RUN mkdir data
RUN npm init -f

ADD ./nestjs/norest.config.js /norest
RUN  npm install @norest/cli @norest/plugin-health

CMD  ["npx", "norest", "--port=80"]