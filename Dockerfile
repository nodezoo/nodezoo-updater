# nodezoo-npm-update

FROM node:4

RUN mkdir /src

ADD package.json /src/

WORKDIR /src

RUN npm install

COPY . /src

CMD ["node", "-r", "toolbag", "srv/update-dev.js", "--seneca.options.tag=nodezoo-npm-update", "--seneca-log=type:act"]
