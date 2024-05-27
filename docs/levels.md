# Levels

## Built-in Levels

There are several built-in levels. Each of these levels has its own name, code and color.

| Level | Code | color |
| ---- | ---- | ---- |
| `emerg` | 0 | `\u001b[33;1m` |
| `alert` | 1 | `\u001b[33m` |
| `crit`  | 2 | `\u001b[31;1m` |
| `error` | 3 | `\u001b[31m` |
| `warn`  | 4 | `\u001b[31m` |
| `note`  | 5 | `\u001b[35m` |
| `info`  | 6 | `\u001b[0m` |
| `debug` | 7 | `\u001b[34m` |

## Transport Levels

However except information purpose the logger levels also help create specialized transports within logger instance that will only log messages with specific levels. For this purpose transports accepts level names that should be logged. 

```js
const logger = new Logger({
	transports: new LoggerConsoleTransport({
		levels: "error"
	})
})

logger.note({ msg: "this message will be ignored" })
logger.error({ msg: "this message will not be ignored" })
```

This can be done as an in example above or later though transport setter.

```js
const transport = new LoggerConsoleTransport()
const logger = new Logger({ transports: [ transport ] })

logger.note({ msg: "note message" })
logger.error({ msg: "error message" })

transport.levels = [ "error" ]

logger.note({ msg: "note message" })
logger.error({ msg: "error message" })
```

## class: `LoggerLevel` 

The LoggerLevel can be useful for creating custom levels, but it's also a class from which other built-in levels inherit.

```js
const { LoggerLevel } = require("spohad")
```

The level `name` describes the name of the current level, the `code` its code and the `color` how the message will be colored at the terminal by the default console transport. Note that by default levels use ANSI colors.

```js
new LoggerLevel("foo", 8, "\u001b[33m")
```
