# nodezoo-npm

FROM node:4

ADD . /

EXPOSE 44005
EXPOSE 43005

CMD ["node","srv/update-dev.js","--seneca.options.tag=npm","--seneca.log.all", "--seneca.options.plugin.npm_update.task=registry_subscribe"]

# build and run:
# $ docker build -t nodezoo-update-04 .
# $ docker run -d -p 44005:44005 -p 43005:43005 -e HOST=$(docker-machine ip default) -e BEANSTALK=192.168.99.1 -e STATS=192.168.99.1 --volumes-from nodezoo-level nodezoo-update-04
# local docker ip:
# $ docker-machine ip default


