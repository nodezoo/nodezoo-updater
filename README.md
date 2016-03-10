![logo-nodezoo][Logo]

# nodezoo-npm-update

- __Sponsor:__ [nearForm][]
- __Lead:__ [Richard Rodger][Lead]

Nodezoo.com micro-service handling npm data. Please see the [main repo][] for more details.

## Install
1. Clone this repo into a root _/nodezoo_ folder.
2. Run `npm install`

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
Any of the messages above can be run using curl in the following format in the command line
```
curl -d '{"role":"npm","task":"registry_subscribe"}' http://localhost:44005/act
```
_Note_: Ports are assigned automatically, please check the logs for the correct port to use.

## Contributing
The [NodeZoo org][] encourages __open__ and __safe__ participation.
​
- __[Code of Conduct][CoC]__
​
If you feel you can help in any way, be it with documentation, examples, extra testing, or new
features please get in touch.
​


## License
Copyright (c) 2015-2016, Richard Rodgers and other contributors.
Licensed under [MIT][].

[main repo]: https://github.com/nodezoo/nodezoo-org
[MIT]: ./LICENSE
[CoC]: https://github.com/nodezoo/nodezoo-org/blob/master/CoC.md
[nearForm]: http://www.nearform.com/
[CoC]: https://github.com/nodezoo/nodezoo-org/blob/master/CoC.md
[Lead]: https://github.com/rjrodger
[NodeZoo org]: https://github.com/nodezoo
[Logo]: https://github.com/nodezoo/nodezoo-org/blob/master/assets/logo-nodezoo.png
