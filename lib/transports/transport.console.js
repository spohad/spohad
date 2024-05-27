'use strict'

const { LoggerTransport } = require("../transport.js");

const CONSOLE_CHANNEL_DEFAULT_COLOR = "\u001b[0m"

class LoggerConsoleTransport extends LoggerTransport {

    constructor(options = {}) {
        super({ decodeStrings: false, levels: options.levels })
        this.paint = options.paint === false ? options.paint : true
    }

    write(chunk, encoding, callback) {
        const color = (chunk.level != null ? chunk.level.color : null) || CONSOLE_CHANNEL_DEFAULT_COLOR
        const message = this.paint ? `${color}${String(chunk)}${CONSOLE_CHANNEL_DEFAULT_COLOR}` : String(chunk)
        return super.write(message, encoding, callback)
    }

    _write(chunk, encoding, callback) {
        process.stdout.write(chunk, callback)
    }

}

module.exports = { LoggerConsoleTransport }