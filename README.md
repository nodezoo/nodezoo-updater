![nodezoo](https://raw.githubusercontent.com/rjrodger/nodezoo-web/to-redux/client/assets/img/logo-nodezoo.png)

## nodezoo-npm-update
Nodezoo.com micro-service handling npm data. Please see the [main repo][] for more details.

- __Sponsor:__ [nearForm][]
- __Lead:__ [Richard Rodger][Lead]

## Install
1. clone this repo into a root _/nodezoo_ folder.
2. run `npm install`

## Starting
To start simply run,

```
npm start
```
### Tagging and Logs
To tag your service and set up logs simply pass the relevant switches on start,

```
npm start -- --seneca.options.tag=nodezoo-npm-update --seneca.log.all
```

## Inbound Messages

This micro-service listens for the following messages:

  * _role:npm,task:registry_subscribe_
  * _role:npm,task:process_modules_
  * _role:npm,task:download_modules_

## Outbound Messages

This micro-service emits no outbound messages.

## Running with Curl

Any of the messages above can be run using curl in the following format in the commanding
```
curl -d '{"role":"npm","task":"registry_subscribe"}' http://localhost:44005/act
```

## Contributing
The [NodeZoo][] org encourages __open__ and __safe__ participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

- Before contributing please review our __[Code of Conduct][CoC]__

## License
Copyright (c) 2015, Richard Rodger and other contributors.
Licensed under [MIT][].

[main repo]: https://github.com/rjrodger/nodezoo
[MIT]: ./LICENSE
[Code of Conduct]: https://github.com/nearform/vidi-contrib/docs/code_of_conduct.md
[nearForm]: http://www.nearform.com/
[nodeZoo]: http://www.nodezoo.com/
[CoC]: ./CoC.md
[Lead]: https://github.com/rjrodger
