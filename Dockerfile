FROM node:alpine

LABEL maintainer="vale@valerauko.net"

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
ENV NODE_PATH /tmp/node_modules:$NODE_PATH

WORKDIR /var/www
