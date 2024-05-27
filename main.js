const { Logger } = require("./lib/logger.js")
const { LoggerLevel } = require("./lib/level.js")
const { LoggerFormatter } = require("./lib/formatter.js")
const { LoggerTransport } = require("./lib/transport.js")
const { LoggerFileTransport } = require("./lib/transports/transport.file.js")
const { LoggerConsoleTransport } = require("./lib/transports/transport.console.js")

module.exports = {
    Logger,
    LoggerLevel,
    LoggerFormatter,
    LoggerTransport,
    LoggerFileTransport,
    LoggerConsoleTransport,
}