FROM node:6.10-onbuild

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json

RUN npm install -g nodemon

#RUN apt-get update && apt-get install -y python
#RUN npm install -g node-gyp
RUN npm install
