[rfc5424]: https://www.rfc-editor.org/rfc/rfc5424

# Formatter

## class: `LoggerFormatter`

The LoggerFormatter takes message and format it using string template with identifiers separated by a percent sign passed at the constructor.

```js
const { LoggerFormatter } = require("spohad")
```

### Template 

The formatter accepts in consturctor a string template into which the passed in message will be converted. If no template is present [rfc5424][rfc5424] template will be used.

```js
const template = `%handler%` // identifier
const formatter = new LoggerFormatter(template)
```

By default template identifiers will be replaced by the handler results, if no handlers is attached, formatter will try to retrieve value from the message.

```js
const template = `foo: %foo%` // identifier
const formatter = new LoggerFormatter(template)

// print: foo: bar
console.log(formatter.format({ foo: "bar" }))
```

However, if the template identifier cannot be replaced by both the handler result and the message value the identifier will be replaced by `-` character.

```js
const template = `foo: %handler%` // identifier
const formatter = new LoggerFormatter(template)

// print: foo: -
console.log(formatter.format({}))
```

### Handlers

As mention before the message formatter also can be proceed by the binded to template identifiers handlers. They can be added through the constructor.

```js
function handler(message) { 
	return "bar" 
}

const template = `foo: %foo%` // identifier
const formatter = new LoggerFormatter(template, {
	foo: handler
})

// print: foo: bar
console.log(formatter.format({}))
```

As for the argument every handler takes passed to the formatter message.

```js
function handler(message) {
	return message["lang"] === "es" ? "Hola" : "Hello"
}

const template = "%hello%, %name%!"
const formatter = new LoggerFormatter(template)

formatter.set("hello", handler)

// print: Hola, John!
console.log(formatter.format({name: "John", lang: "es"}))
```

By default the logger fomratter contain next handlers:

- The `sd` handler convert structure data to rfc5424 format.
- The `pri` handler calculates message priority based on its `facility` and `level`.
- The `timestamp` handler convert timestamp to the ISO string or if it is not present create new one.

### formatter.template 

The `template` property gets or sets current formatter template. 

```js
const template = `%handler%` // identifier
const formatter = new LoggerFormatter()

formatter.template = template

// print: true
console.log(formatter.template === template)
```

### formatter.set(identifier, handler)

The `set()` method set handler for the template identifier. 

```js
function handler(message) { return "bar" }

const template = `foo: %foo%` // identifier
const formatter = new LoggerFormatter(template)

formatter.set("foo", handler)

// print: foo: bar
console.log(formatter.format({}))
```

If a non-function handler is passed, an error will be thrown.

```js
// throw error
formatter.set("foo", {})
```

### formatter.get(identifier)

The `get()` method get handler for the template identifier. 

```js
function handler(message) { return "bar" }

const template = `foo: %foo%`
const formatter = new LoggerFormatter(template)

formatter.set("foo", handler)

// print: true
console.log(formatter.get('foo') === handler)
```

### formatter.has(identifier)

The `has()` method check if handler with provided identifier is present. 

```js
function handler(message) { return "bar" }

const template = `foo: %foo%`
const formatter = new LoggerFormatter(template)

formatter.set("foo", handler)

// print: true
console.log(formatter.has('foo'))
```

### formatter.delete(identifier)

The `delete()` method delete handler with provided identifier from the formatter. 

```js
function handler(message) { return "bar" }

const template = `foo: %foo%`
const formatter = new LoggerFormatter(template)

formatter.set("foo", handler)
formatter.delete("foo")

// print: false
console.log(formatter.has('foo'))
```

### formatter.format(message)

The `format()` method format message to the current formatter template.

```js
const template = `foo: %foo%`
const formatter = new LoggerFormatter(template)

// print: foo: bar
console.log(formatter.format({ foo: "bar" }))
```

### _format(key, message)

The `_format()` method defines how the values will be serialized. By default the formatter serialize values using default Node.js `util` library and its `format` function, however its can be changed by implementing the formatter `_format` method.

```js
_format(key, value) {
    // some logic
}
```