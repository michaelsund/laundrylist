FROM node:4.7.2-onbuild

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./server/package.json /usr/src/app/package.json

RUN npm install -g nodemon
RUN npm install
