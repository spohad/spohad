'use strict'

const kFormatter = Symbol("kFormatter")

class LoggerMessage {

    constructor(formatter, ...chunks) {
        Object.assign(this, ...chunks)

        if(formatter != null)
            this[kFormatter] = formatter

    }

    toString() {
        return this[kFormatter].format(this)
    }

}

module.exports = { LoggerMessage }