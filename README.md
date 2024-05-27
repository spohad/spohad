<div align="center"><img src="https://raw.githubusercontent.com/spohad/graphics/b537c78267305cd2cd19cabce6bf67462ce3108f/tape_banner.svg"/></div>

# About

The spohad is a lightweight and easy to use TypeScript and JavaScript logger utility for creating simple and/or complex logging systems. 

# Installation

```sh
$ npm i spohad
```

# Quick start

Package could be required as ES6 module 

```js
import { Logger } from 'spohad';
```

Or as commonJS module.

```js
const { Logger } = require('spohad');
```

## Firts Logger

Logging begins by creating a logger instance and adding the first transport to it.

```js 
const { Logger, LoggerConsoleTransport } = require('spohad')

const logger = new Logger({
    transports: new LoggerConsoleTransport()
})
```

Now the logger ready to log messages.

```js 
// print "<14> 1 *timestamp* *hostname* - *pid* - - Hello World!"
logger.info({ msg: "Hello World!" }) 
```

As you can see provided message was formatted and passed to the application stdout.

## First Formatter

By defaul the logger messages will have the [rfc5424](https://www.rfc-editor.org/rfc/rfc5424) structure, but the logger message can be any form as you need. You can change the form and structure of a log message by defining a new log formatter with a new message template or by updating an existing one.

```js 
const { Logger, LoggerFormatter, LoggerConsoleTransport } = require('spohad')

const logger = new Logger({
    transports: new LoggerConsoleTransport()
})

logger.formatter.template = "message: %msg%"

// print "message: Hello World!"
logger.info({ msg: "Hello World!" })
```

## Logger Context

However, sometimes log messages require default values ​​for the message template, in which case these values ​​can be added to the log context. By default, the logger context contains the current `procid`, `hostname`, `version`, etc.

```js 
const { Logger, LoggerConsoleTransport } = require("spohad")

const logger = new Logger({
    formatter: new LoggerFormatter("foo is: %foo%, bar is: %bar%"),
    transports: [
        new LoggerConsoleTransport()
    ],
    context: {
        foo: "bar"
    }
})

// print: foo is bar, bar is baz
logger.info({ bar: "baz" })
``` 

## First Log File

For now logging was only to the console but what about the log files? The spohad logger is not limited to just console logging, it also provides file logging.

```js 
const { Logger, LoggerConsoleTransport, LoggerFileTransport } = require("spohad")

const logger = new Logger({
    transports: [
        new LoggerConsoleTransport(),
        new LoggerFileTransport("./logs", "test")
    ]
})

logger.info({ msg: "Hello World!" })
```

In this case except the console message also will be logged to the log file at the logs directory.

## Level Based Logging 

For this moment every message is logged in all transports, however the transport can define the message levels that will be logged, any other level will be ignored.

```js 
const { Logger, LoggerConsoleTransport, LoggerFileTransport } = require("spohad")

const logger = new Logger({
    transports: [
        new LoggerConsoleTransport(),
        new LoggerFileTransport("./logs", "test", { levels: [ "error" ] })
    ]
})

logger.info({ msg: "Hello World!" })
logger.error({ msg: "OOPS!" })
```

## Documentation

You can read about advanced formatting, file rotation, compression, custom levels, and much more in the following [documentation](https://github.com/spohad/spohad/tree/main/docs).

## License

[MIT](https://github.com/spohad/spohad/blob/main/LICENSE)


