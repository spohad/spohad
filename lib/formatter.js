'use strict'

const util = require("util")

class FormatterTemplateTypeError extends Error {
    constructor() {
        super('Formatter template should be type of string.')
    }
}

class FormatterHandlerTypeError extends Error {
    constructor() {
        super('Formatter handler should be type of function.')
    }
}

class FormatterStructureDataIdError extends Error {
    constructor() {
        super('Message structure data "id" is not defined.')
    }
}

class FormatterStructureDataTypeError extends Error {
    constructor() {
        super('Message structure data should be type of object.')
    }
}

function priority(message) {
    return (message.facility || 1) * 8 + (message.level.code || 1)
}

function timestamp(message) {
    return message.timestamp != null ? 
        (message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp) : 
        (new Date().toISOString())
}

const FORMATTER_TEMPLATE = "<%pri%> %version% %timestamp% %hostname% %app_name% %procid% %msgid% %sd% %msg%\n"

function sd(message) {

    function serializer(value) {

        if(typeof value !== 'object')
            throw new FormatterStructureDataTypeError
    
        const { id, ...rest } = value  
    
        if(id == null) 
            throw new FormatterStructureDataIdError()
    
        const payload = Object.keys(rest).reduce((acc, key) => {
            const value = rest[key]
            return value == null ? 
                acc : acc += ` ${key}="${util.format(value).replace(/\"|\[|\]/g, (key) => "\\" + key)}"`
        }, "")
    
        return `[${id}${payload}]`

    }

    if(message.sd == null)
        return

    const value = message.sd

    return Array.isArray(value) ? value.map(item => serializer(item)).join("") : serializer(value)

}

class LoggerFormatter {

    constructor(template = FORMATTER_TEMPLATE, handlers) {
        this.template = template
        this._formatters = { sd, timestamp, pri: priority }

        if(handlers != null)
            Object.keys(handlers).forEach(key => this.set(key, handlers[key]))
        
    }

    get template() {
        return this._template
    }

    set template(template) {

        if(typeof template !== 'string')
            throw new FormatterTemplateTypeError()

        this._template = template
        this._matcher = new RegExp(`${(template.match(/\%(.*?)\%/gi) || []).join("|")}`, "gi")
    }

    set(key, handler) {

        if(typeof handler !== "function")
            throw new FormatterHandlerTypeError

        this._formatters[key] = handler
        
        return this
    }

    has(key) {
        return this._formatters[key] != null
    }

    get(key) {
        return this._formatters[key]
    }

    delete(key) {
        delete this._formatters[key]
    }

    format(message) {
        return this.template.replace(this._matcher, (match) => {
            const key = match.substring(1, match.length - 1)
            const aMessageValue = message[key]
            const aHandlerValue = this.has(key) ? this.get(key)({ ...message }) : null

            return aHandlerValue == null ? 
                (aMessageValue != null ? this._format(match, aMessageValue) : "-") : 
                (this._format(match, aHandlerValue))
                
        })
    }

    _format(key, value) {
        return util.format(value)
    }

}

module.exports = { priority, timestamp, sd, LoggerFormatter }