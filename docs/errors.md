# Errors

When an error occurs in the logger transport, in addition to calling the `unpipe()` method, the logger also handles the error and emits it as part of the `error` event.

```js
const transport = new LoggerConsoleTransport()
const logger = new Logger({ transports: [ transport ] })

logger.template = "%msg%"

// print: oops
logger.on("error", (error) => console.log(error.message))

transport.destroy(new Error('oops'))
```

This, in addition to preventing the application from crashing, also allows the transport error to be logged to other transports with, for example, a crit level.

```js
const transport = new LoggerConsoleTransport()
const logger = new Logger({ transports: [ 
    transport,
    new LoggerConsoleTransport()
] })

logger.template = "%msg%"

// print: oops
logger.on("error", (error) => logger.crit({ msg: error.message }))

transport.destroy(new Error('oops'))
```
