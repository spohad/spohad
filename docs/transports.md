[levels]: https://github.com/spohad/spohad/blob/main/docs/levels.md

# Transports

## class: `LoggerTransport`

The LoggerTransport the class from which all others default transports inherit. 

```js
const { LoggerTransport } = require("spohad")
```

By itself implements the basic Node.js `Writable` stream, which allow easy usage and predictable behavior. By default the transport has no functionality and extending is similar to the extending base Node.js writable stream.

```js
_write(chunk, encoding, callback) {
    // some logic
}
```

But with one main difference: the transport serialize any data provided to the `write()` method. So if you need to interact with a raw logger message the best way to do it its override `write()` method and then call its method from super.

```js
write(message, encoding, callback) {
    message['foo'] = 'bar'
    return super.write(message, encoding, callback)
}
```

## class: `LoggerConsoleTransport` 

The LoggerConsoleTransport provides simple transport to the application stdout with optional message painting. 

```js
const { LoggerConsoleTransport } = require("spohad")
```

### Levels

The transport [levels][levels] could be set from the constructor.

```js
new LoggerConsoleTransport({levels: "error"})
new LoggerConsoleTransport({levels: ["error", "debug"]})
```

Or thought transport setter.

```js
const consoleTransport = new LoggerConsoleTransport() 
consoleTransport.levels = "error"
consoleTransport.levels = ["error", "debug"]
```

### Painting

Except message level filtering every message from the this transport will be colored using its level color.

```js
const logger = new Logger({ 
	transports: [ new LoggerConsoleTransport() ] 
})

logger.note({ msg: "Hello World!" }) 
```

However it can be disabled by setting `paint` option to `false`.

```js
const logger = new Logger({ 
	transports: [ new LoggerConsoleTransport({ paint: false }) ] 
})

logger.note({ msg: "Hello World!" }) 
```

## class: `LoggerFileTransport`

The LoggerFileTransport helps to interact with file logs, their writing, optional rotation and file compressing. File rotation can take place according to both the file size and time limits. The file transport accepts three arguments it is `dir`, `filename` and `options`, first two arguments is required, they define where logs will be writted and stored.

```js
const { LoggerFileTransport } = require("spohad")
```

### Directory

The file transport `dir` defines current file transport directory where will be save logs. If directory isn\`t exist it will created with `recursive` flag which means that every directory to the target will also be created.

```js
new LoggerFileTransport("./dir")
```

### Filenames

The `filename` defines the file name which will be used by creating actual log file name by combining the provided one and the timestamp formatted by the template.

```js
new LoggerFileTransport("./dir", "filename")
```

The timestamp template defaulted to the `yyyy-MM-dd-hh` however it could be changed could be changed by the `fileDateTemplate` property. 

```js 
new LoggerFileTransport("./logs", "log", { 
	fileDateTemplate: "yyyy" 
}) // Creates file `log-*year*.log
```

### Compress

The log files could be writed both in the default `log` format or in the compressed `gz` which is achieved by setting the `compress` property to `true`.

```js
new LoggerFileTransport("./logs", "log", {
	compress: true
})
```

### Rotation

File can be rotated based on time. For its purpose transport have the `fileTimeLimit` property. This option accepts values in date format identifiers i.e. `MM` - month, `dd` - day, `HH` - hour, `mm` - minute.

```js
new LoggerFileTransport("./logs", "log", {
	fileTimeLimit: "dd"
}) // Sets file rotation to every day midnight
```

Except time, file also can be rotated using its actual size. The `fileSizeLimit` property sets the file size limit after which rotation will be performed. 

```js
new LoggerFileTransport("./logs", "log", {
	fileSizeLimit: "16kb" 
})
```
It also could be number in bytes.

```js
new LoggerFileTransport("./logs", "log", {
	fileSizeLimit: 16000
})
```

In most cases file rotation mean deleting old file, but this can be changed using `saveRotationFile` to `true`. In this case every file will be saved. Note that if previous file have same name, new one will have number id. 

```js
new LoggerFileTransport("./logs", "log", {
	fileSizeLimit: "16kb",
	saveRotationFile: true
})
```

### Levels

Same as the console transport the file transport supports [level][levels] messaging.

```js
new LoggerFileTransport("./logs", "log", {levels: "error"})
new LoggerFileTransport("./logs", "log", {levels: ["error", "debug"]})
```

Or thought transport setter.

```js
const fileTransport = new LoggerFileTransport("./logs", "log") 
fileTransport.levels = "error"
fileTransport.levels = ["error", "debug"]
```

### transport.fd

The `fd` return current file descriptor.

```js
const fileTransport = new LoggerFileTransport("./logs", "log") 

// print: *number*
console.log(fileTransport.fd)
```

### transport.path

The `path` option is path to the file the stream is writing.

```js
const fileTransport = new LoggerFileTransport("./logs", "log") 

// print: *file path*
console.log(fileTransport.path)
```

### transport.compress

The `compress` option indicates whether the file should be compressed or not.

```js
const fileTransport = new LoggerFileTransport("./logs", "log", {
	compress: true
}) 

// print: true
console.log(fileTransport.compress)
```

### transport.bytesWritten

The `bytesWritten` is bytes written so far. Does not include data that is still queued for writing.

```js
const fileTransport = new LoggerFileTransport("./logs", "log") 

// print: 0
console.log(fileTransport.bytesWritten)
```