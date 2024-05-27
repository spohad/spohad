'use strict'

const { LoggerLevel } = require("./level.js")

class EmergencyLevel extends LoggerLevel {
    constructor() {
        super("emerg", 0, "\u001b[33;1m")
    }
}

class AlertLevel extends LoggerLevel {
    constructor() {
        super("alert", 1, "\u001b[33m")
    }
}

class CriticalLevel extends LoggerLevel {
    constructor() {
        super("crit", 2, "\u001b[31;1m")
    }
}

class ErrorLevel extends LoggerLevel{
    constructor() {
        super("error", 3, "\u001b[31m")
    }
}

class WarningLevel extends LoggerLevel{
    constructor() {
        super("warn", 4, "\u001b[31m")
    }
}

class NoticeLevel extends LoggerLevel {
    constructor() {
        super("note", 5, "\u001b[35m")
    }
}

class InfoLevel extends LoggerLevel{
    constructor() {
        super("info", 6, "\u001b[0m")
    }
}

class DebugLevel extends LoggerLevel {
    constructor() {
        super("debug", 7, "\u001b[34m")
    }
}

module.exports = { 
    emerg:      new EmergencyLevel, 
    alert:      new AlertLevel, 
    crit:       new CriticalLevel, 
    error:      new ErrorLevel, 
    warn:       new WarningLevel, 
    note:       new NoticeLevel, 
    info:       new InfoLevel, 
    debug:      new DebugLevel 
}