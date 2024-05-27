'use strict'

const os = require("os")
const EventEmitter = require("events");
const { randomUUID } = require("crypto");
const { LoggerLevel } = require("./level.js");
const { LoggerMessage } = require("./message.js");
const { LoggerFormatter } = require("./formatter.js");
const { LoggerTransport } = require("./transport.js")
const { emerg, alert, crit, error, warn, note, info, debug } = require("./levels.js");

const kClear = Symbol('kClear')
const LOGGER_EVENT_ERROR = "error"
const LOGGER_EVENT_CLOSE = "close"
const LOGGER_EVENT_FINISH = "finish"

class LoggerContextTypeError extends Error {
    constructor() { 
        super("Logger context should be type of object.") 
    }
}

class LoggerLevelTypeError extends Error {
    constructor() { 
        super("Logger level should be instance of LoggerLevel.") 
    }
}

class LoggerMessageTypeError extends Error {
    constructor() { 
        super("Logger message should be type of object.") 
    }
}

class LoggerFormatterTypeError extends Error {
    constructor() { 
        super("Logger formatter should be instance of LoggerFormatter.") 
    }
}

class LoggerTransportTypeError extends Error {
    constructor() { 
        super("Logger transport should be instance of LoggerTransport.") 
    }
}

class Logger extends EventEmitter {

    constructor(options = {}) {
        super()
        const that = this
        const context = options.context
        const transports = options.transports

        if(context != null && typeof context !== 'object')
            throw new LoggerContextTypeError()

        this.formatter = options.formatter != null ? options.formatter : new LoggerFormatter()

        this._name = options.name || randomUUID()
        this._pipes = []
        this._listeners = [
            [ LOGGER_EVENT_ERROR, function(error) { return that.emit(LOGGER_EVENT_ERROR, error)  } ],
            [ LOGGER_EVENT_CLOSE, function() { return that.unpipe(this) } ],
            [ LOGGER_EVENT_FINISH, function() { return that.unpipe(this) } ],
        ]

        if(transports != null) 
            (Array.isArray(transports) ? transports : [ transports ]).forEach(transport => this.pipe(transport))

        this._context = Object.assign({
            "pub": this.name,
            "procid": process.pid, 
            "version": 1, 
            "hostname": os.hostname(),
        }, context)

    }

    get name() {
        return this._name
    }

    get context() {
        return this._context
    }

    get formatter() {
        return this._formatter
    }

    set formatter(formatter) {

        if(!(formatter instanceof LoggerFormatter))
            throw new LoggerFormatterTypeError()

        this._formatter = formatter

    }

    emerg(chunk) {
        return this.log(emerg, chunk)
    }
    
    alert(chunk) {
        return this.log(alert, chunk)
    }
    
    crit(chunk) {
        return this.log(crit, chunk)
    }
    
    error(chunk) {
        return this.log(error, chunk)
    }
    
    warn(chunk) {
        return this.log(warn, chunk)
    }
    
    note(chunk) {
        return this.log(note, chunk)
    }
    
    info(chunk) {
        return this.log(info, chunk)
    }
    
    debug(chunk) {
        return this.log(debug, chunk)
    }
    
    log(level, chunk) {

        if(!(level instanceof LoggerLevel))
            throw new LoggerLevelTypeError()

        if(chunk === null || typeof chunk !== 'object' )
            throw new LoggerMessageTypeError()

        const aLoggerMessage = new LoggerMessage(this.formatter, this._context, { timestamp: new Date() }, chunk, { level })
        
        for(let i = 0; i < this._pipes.length; i++) {
            const transport = this._pipes[i]

            if(!transport.destroyed && !transport.writableEnded && (!transport.levels.length || transport.levels.includes(level.name)))
                transport.write(aLoggerMessage)

        }


        return this
    }

    pipe(transport) {

        if(!(transport instanceof LoggerTransport)) 
            throw new LoggerTransportTypeError()

        if(this._pipes.includes(transport))
            return transport

        this._pipes.push(transport)
        this._listeners.forEach(listener => transport.on(listener[0], listener[1]))

        return transport
    }

    unpipe(transport) {

        if(!this._pipes.includes(transport))
            return this

        this._pipes.splice(this._pipes.indexOf(transport), 1)
        this._listeners.forEach(listener => transport.off(listener[0], listener[1]))

        if(!this._pipes.length)
            this.emit(kClear)

        return this
    }

    end(callback) {
        this._pipes.forEach(transport => transport.end())

        if(callback != null)
            this.on(kClear, callback)

    }

    destroy() {
        this._pipes.forEach(transport => transport.destroy())
    }

}

module.exports = { Logger }