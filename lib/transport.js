'use strict'

const { Writable } = require("stream");

class LoggerTransport extends Writable {

    constructor(options = {}) {
        super(options)

        this._levels = []
        
        if(options.levels != null)
            this.levels = options.levels
        
    }

    get levels() {
        return this._levels
    }

    set levels(levels) {
        this._levels = Array.isArray(levels) ? levels : [ levels ]
    }

    write(message, encoding, callback) {
        return super.write(String(message), encoding, callback)
    }

    _final(callback) {
        return callback()
    }

    _destroy(error, callback) {
        return callback(error)
    }

}

module.exports = { LoggerTransport }