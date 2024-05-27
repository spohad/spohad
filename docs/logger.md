[levels]: https://github.com/spohad/spohad/blob/main/docs/levels.md
[formatter]: https://github.com/spohad/spohad/blob/main/docs/formatter.md
[transports]: https://github.com/spohad/spohad/blob/main/docs/transports.md

# Logger

## Class: `Logger`

The Logger is an entry point for the entire log system which takes messages and send them to the underlying transports. 

```js
const { Logger } = require("spohad")
```

### Transport

To start logging the logger require some [transports][transports] from where passed message could be sent to the underlying systems. This role is performed by LoggerTransport instances. Transport could be added to the logger by several ways. One of them is through the constructor.

```js
const logger = new Logger({
    transports: [ new LoggerConsoleTransport() ]
})
```

### Formatter 

All logger messages are converted into the appropriate form before being sent to the underlying systems. This appropriate message form is determined by the log [formatter][formatter] for all log messages. The logger formatter along with the structure of the logger messages can be specified using the log "formatter" option.

```js
const formatter = new LoggerFormatter()
const logger = new Logger({ formatter })
```

### Context

Every logger instance have its own context, object with a properties and their values which lately will be passed to underlying transports as parts of the logger message if its is not already present in provided payload. The logger context could be set using the logger `context` option.

```js
const logger = new Logger({ 
    context: { group: "mygroup" },
})
```

### Name 

With the exception of transports, contexts and formatter, each logger also has its own name, which will be generated as a random UUID by default. This name will also be used in the context as the value of the `pub` property.

```js
const logger = new Logger({ 
    name: "My logger"
})
```

### logger.name 

The `name` option return current logger name.

```js
const logger = new Logger({ 
    name: "logger"
})

// print: logger
console.log(logger.name)
```

### logger.context

The `context` option contain the logger context.

```js
const logger = new Logger({ 
    context: { foo: 'bar' }
})

// print: bar
console.log(logger.contex.foo)
```

### logger.formatter

The `formatter` option contain formatter which will be used under message formatter.

```js
const logger = new Logger()

// print: LoggerFormatter {
//  ...
// }
console.log(logger.formatter)
```

### logger.pipe(transport)

The `pipe()` method adds a transport to the logger instance, allowing it to receive logger messages.

```js
const logger = new Logger()

logger.pipe(new LoggerConsoleTransport())
```

### logger.unpipe(transport)

The `unpipe()` method removes transport from the logger.

```js
const logger = new Logger()
const transport = new LoggerConsoleTransport()

logger.pipe(transport)
logger.unpipe(transport)
```

This method will also be called after transport `error` event.

### logger.log(level, message)

The `log()` method accepts desired message [level][levels] and actual payload. When the logger sends message to the transports it does not wait for a response that the message was successfully sent. This is done in order to prevent a bottleneck situation for the entire system and this is fair how to independent logger and relay instances. 

```js
logger.log(new LoggerLevel('foo', 9), { msg: "message" })
```

### logger.info(message)

The `info()` method log message with info level.

```js
logger.info({ msg: "message" })
```

### logger.error(message)

The `error()` method log message with error level.

```js
logger.error({ msg: "message" })
```

### logger.alert(message)

The `alert()` method log message with alert level.

```js
logger.alert({ msg: "message" })
```

### logger.debug(message)

The `debug()` method log message with debug level.

```js
logger.debug({ msg: "message" })
```

### logger.note(message)

The `note()` method log message with note level.

```js
logger.note({ msg: "message" })
```

### logger.warn(message)

The `warn()` method log message with warn level.

```js
logger.warn({ msg: "message" })
```

### logger.crit(message)

The `crit()` method log message with crit level.

```js
logger.crit({ msg: "message" })
```

### logger.emerg(message)

The `emerg()` method log message with emerg level.

```js
logger.emerg({ msg: "message" })
```

### logger.end([callback])

The `end()` method ends all piped transports. 

```js
logger.end()
```

The method accepts a callback that will be called when the transports have completed internal processes, such as issuing remaining data to the output, etc., this allows the `end()` method to be used as a graceful shutdown of the logger and all underlying transports.

```js
logger.end(callback)
```

### logger.destroy()

The `destroy()` method destroys all piped transports. Main difference between the destroy and the end method it is the transport destroy logic it doesn\`t wait until internal processes has been ended, but the end do. 

```js
logger.destroy()
```