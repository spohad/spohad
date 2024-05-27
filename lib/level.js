'use strict'

class LoggerLevel {

    constructor(name, code, color) {
        this._name = name
        this._code = code
        this._color = color
    }

    get name() {
        return this._name
    }

    get code() {
        return this._code
    }

    get color() {
        return this._color
    }

    toString() {
        return String(this.name)
    }

}

module.exports = { LoggerLevel }