const os = require("os")
const assert = require("node:assert")
const { describe, it } = require('node:test');
const { Logger } = require(`../lib/logger.js`)
const { LoggerTransport } = require(`../lib/transport.js`)
const { LoggerFormatter } = require(`../lib/formatter.js`)
const { LoggerMessage } = require(`../lib/message.js`)
const { Writable } = require("node:stream");
const { crit, debug } = require("../lib/levels.js")

class TransportMock extends LoggerTransport {

    constructor(options) { 
        super(options)
    }

    _write(chunk, encoding, callback) {
        callback()
    }

}

describe("Logger", function() {

    describe("constructor", function() {

        it("should set the logger name through constructor", function(t) {
            const aName = 'foo'
            const aLogger = new Logger({ name: aName })

            assert.strictEqual(aLogger.name, aName)
        })

        it("should set the logger default name as uuid", function(t) {
            const aLogger = new Logger()

            assert.ok(aLogger.name)
        })

        it("should set the logger context though constructor", function(t) {
            const aContext = { foo: "bar", version: 2 }
            const aLogger = new Logger({ context: aContext })

            assert.strictEqual(aLogger.context.foo, aContext.foo)
            assert.strictEqual(aLogger.context.version, aContext.version)
        })

        it("should set the logger context default values", function(t) {
            const aLogger = new Logger()
            const aContext = { pub: aLogger.name, "procid": process.pid, "version": 1, "hostname": os.hostname(), }

            assert.deepStrictEqual(aLogger.context, aContext)
        })

        it(`should set the logger formatter though the constructor`, function() {
            const aFormatter = new LoggerFormatter("%test%")
            const aLogger = new Logger({ formatter: aFormatter })
    
            assert.strictEqual(aLogger.formatter, aFormatter)
        })

        it(`should set the LoggerFormatter if no other formatter is provided`, function() {
            const aLogger = new Logger()

            assert.ok(aLogger.formatter instanceof LoggerFormatter)
        })


        it("should set the logger transports through constructor", function(t) {
            const aTransport = new TransportMock()
            new Logger({ transports: aTransport })

            assert.strictEqual(aTransport.listenerCount("error"), 1)
            assert.strictEqual(aTransport.listenerCount("close"), 1)
            assert.strictEqual(aTransport.listenerCount("finish"), 1)
        })

        it("should add multiple transports to the logger  through constructor", function(t) {
            const aTransportOne = new TransportMock()
            const aTransportTwo = new TransportMock()
            new Logger({ transports: [ aTransportOne, aTransportTwo ] })

            assert.strictEqual(aTransportOne.listenerCount("error"), 1)
            assert.strictEqual(aTransportOne.listenerCount("close"), 1)
            assert.strictEqual(aTransportOne.listenerCount("finish"), 1)

            assert.strictEqual(aTransportTwo.listenerCount("error"), 1)
            assert.strictEqual(aTransportTwo.listenerCount("close"), 1)
            assert.strictEqual(aTransportTwo.listenerCount("finish"), 1)
        })

        it("should throw an error when context is not type of object", function() {
            assert.throws(_ => new Logger({ context: 123 }), { message: "Logger context should be type of object." })
        })

    })

    describe("formatter", function() {

        it(`should set the logger formatter`, function() {
            const aFormatter = new LoggerFormatter("%test%")
            const aLogger = new Logger()

            aLogger.formatter = aFormatter
    
            assert.strictEqual(aLogger.formatter, aFormatter)
        })

        it("should throw an error when formatter is not instance of LoggerFormatter", function() {
            assert.throws(_ => new Logger({ formatter: {} }), { message: "Logger formatter should be instance of LoggerFormatter." })
        })

    })

    describe("event: error", function() {

        it(`should be emitted when transport emit "error"`, function(t, done) {
            const aError = new Error("oops")
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            aLogger.on("error", (error) => {
                assert.strictEqual(error, aError)
                done()
            })
    
            aTransport.destroy(aError)
    
        })

    })
    
    describe("pipe", function() {

        it(`should pipe transport to the logger`, function() {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            assert.strictEqual(aTransport.listenerCount("error"), 1)
            assert.strictEqual(aTransport.listenerCount("close"), 1)
            assert.strictEqual(aTransport.listenerCount("finish"), 1)

        })

        it(`should not pipe transport to the logger if it is already piped`, function() {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            assert.strictEqual(aTransport.listenerCount("error"), 1)
            assert.strictEqual(aTransport.listenerCount("close"), 1)
            assert.strictEqual(aTransport.listenerCount("finish"), 1)
        })

        it(`should emit transport error as part of "error" event if one occurs`, function(t, done) {
            const aError = new Error()
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.on("error", (error) => {
                assert.strictEqual(error, aError)
                done()
            })

            aLogger.pipe(aTransport)

            aTransport.destroy(aError)

        })

        it(`should throw an error when transport is not instance of LoggerTransport`, function() {
            const aLogger = new Logger()
            const aTransport = new Writable({ write() { return 'bar' } })

            assert.throws(_ => aLogger.pipe(aTransport),{ message: "Logger transport should be instance of LoggerTransport." })
        })

    })

    describe("unpipe", function() {

        it(`should unpipe transport from the logger`, function() {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)
            aLogger.unpipe(aTransport)

            assert.strictEqual(aTransport.listenerCount("error"), 0)
            assert.strictEqual(aTransport.listenerCount("close"), 0)
            assert.strictEqual(aTransport.listenerCount("finish"), 0)

        })

        it(`should unpipe transport after its "close" event`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            aTransport.once("close", () => {
                assert.strictEqual(aTransport.listenerCount("error"), 0)
                assert.strictEqual(aTransport.listenerCount("close"), 0)
                assert.strictEqual(aTransport.listenerCount("finish"), 0)
                done()
            })

            aTransport.destroy()

        })

        it(`should unpipe transport after its "close" event`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            aTransport.once("finish", () => {
                assert.strictEqual(aTransport.listenerCount("error"), 0)
                assert.strictEqual(aTransport.listenerCount("close"), 0)
                assert.strictEqual(aTransport.listenerCount("finish"), 0)
                done()
            })

            aTransport.end()

        })

    })

    describe("log", function() {

        it(`should transform message to the LoggerMessage instance`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aTransport.on("error", done)

            t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(chunk instanceof LoggerMessage, true)
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(debug, {})
        }) 

        it(`should pass payload from the message to the logger message`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()
            const aMessage = { foo: "bar", bar: "baz" }

            aTransport.on("error", done)

            t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(chunk.foo, aMessage.foo)
                assert.strictEqual(chunk.bar, aMessage.bar)
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(debug, aMessage)
        }) 

        it("should assign default value from the context if they are not present at message", function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()
            const aMessage = { foo: "bar", version: 2 }

            t.mock.method(aTransport, "write", (data, encoding, callback) => {
                assert.strictEqual(data.foo, "bar")
                assert.strictEqual(data.pub, aLogger.name)
                assert.strictEqual(data.procid, process.pid)
                assert.strictEqual(data.version, 2)
                assert.strictEqual(data.hostname, os.hostname())
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(debug, aMessage)
        })

        it("should set the message timestamp", function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            t.mock.method(aTransport, "write", (data, encoding, callback) => {
                const currTimestamp = timestamp.toISOString()
                const dataTimestamp = data.timestamp.toISOString()
                assert.strictEqual(dataTimestamp.substring(0, dataTimestamp.indexOf('.')), currTimestamp.substring(0, currTimestamp.indexOf('.')))
                done()
            })

            aLogger.pipe(aTransport)

            const timestamp = new Date()

            aLogger.log(debug, {})
        })

        it("should not override the message timestamp", function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()
            const aMessage = { timestamp: new Date }

            t.mock.method(aTransport, "write", (data, encoding, callback) => {
                assert.equal(data.timestamp, aMessage.timestamp)
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(debug, aMessage)
        })

        it(`should set message level to the provided one`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()
            const aLevel = debug
            const aMessage = { foo: 'bar' }

            aTransport.on("error", done)

            t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(chunk instanceof LoggerMessage, true)
                assert.strictEqual(chunk.level, aLevel)
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(aLevel, aMessage)
        }) 

        it(`should override message level to the provided one`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()
            const aLevel = debug
            const aMessage = { foo: 'bar', level: "bar" }

            aTransport.on("error", done)

            t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(chunk instanceof LoggerMessage, true)
                assert.strictEqual(chunk.level, aLevel)
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(aLevel, aMessage)
        }) 
        
        it(`should set logger formatter as message formatter`, function(t, done) {
            const aFormatter = new LoggerFormatter("%foo%")
            const aLogger = new Logger({ formatter: aFormatter })
            const aTransport = new TransportMock()

            aTransport.on("error", done)

            t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(String(chunk), "bar")
                done()
            })

            aLogger.pipe(aTransport)
            aLogger.log(debug, { foo: "bar", bar: "baz" })
        }) 

        it(`should write message if transport is not writable`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            const aWriteMock = t.mock.method(aTransport, "write")
            const aFinalMock = t.mock.method(aTransport, "_final", (callback) => setImmediate(callback))

            aTransport.end()
            aLogger.log(debug, { foo: "bar", bar: "baz" })

            setImmediate(() => {
                assert.strictEqual(aWriteMock.mock.callCount(), 0)
                assert.strictEqual(aFinalMock.mock.callCount(), 1)
                done()
            })
        }) 

        it(`should write message if transport is destroyed`, function(t, done) {
            const aLogger = new Logger()
            const aTransport = new TransportMock()

            aLogger.pipe(aTransport)

            const aWriteMock = t.mock.method(aTransport, "write")
            const aFinalMock = t.mock.method(aTransport, "_destroy", (error, callback) => setImmediate(callback))

            aTransport.destroy()
            aLogger.log(debug, { foo: "bar", bar: "baz" })

            setImmediate(() => {
                assert.strictEqual(aWriteMock.mock.callCount(), 0)
                assert.strictEqual(aFinalMock.mock.callCount(), 1)
                done()
            })
        }) 

        it("should not write message if transport levels names is not match to message level name", function(t, done) {
            const aLevel = crit
            const aFormatter = new LoggerFormatter("%foo%")
            const aLogger = new Logger({ formatter: aFormatter })
            const aTransport = new TransportMock({ levels: aLevel.name })

            aTransport.on("error", done)

            const aTrasportWriteMock = t.mock.method(aTransport, "write", (chunk, encoding, callback) => {
                assert.strictEqual(chunk instanceof LoggerMessage, true)
                assert.strictEqual(chunk.level, aLevel)
            })

            aLogger.pipe(aTransport)
        
            aLogger.log(debug, { foo: "bar", bar: "baz" })
            aLogger.log(crit, { foo: "bar", bar: "baz" })

            assert.strictEqual(aTrasportWriteMock.mock.callCount(), 1)

            done()

        })

        it(`should throw an error when level is not instance of LoggerLevel`, function(t) {
            const aLogger = new Logger()
            assert.throws(_ => aLogger.log({}, {}),{ message: "Logger level should be instance of LoggerLevel." })
        })

        it(`should throw an error when message is not type of object`, function(t) {
            const aLogger = new Logger()
            assert.throws(_ => aLogger.log(debug, null),{ message: "Logger message should be type of object." })
        })

    })

    describe("end", function() {

        it(`should end all piped transports`, function() {
            const aTransportOne = new TransportMock()
            const aTransportTwo = new TransportMock()

            const aLogger = new Logger({
                transports: [ aTransportOne, aTransportTwo ]
            })

            aLogger.end()

            assert.strictEqual(aTransportOne.writableEnded, true)
            assert.strictEqual(aTransportTwo.writableEnded, true)
        })

        it(`should call callback when all transports is ended`, function(t, done) {
            const aTransportOne = new TransportMock()
            const aTransportTwo = new TransportMock()

            const aFinalMock = t.mock.method(aTransportTwo, "_final", (callback) => setImmediate(callback))

            const aLogger = new Logger({
                transports: [ aTransportOne, aTransportTwo ]
            })

            aLogger.end(() => {
                assert.strictEqual(aFinalMock.mock.callCount(), 1)
                assert.strictEqual(aTransportOne.writableEnded, true)
                assert.strictEqual(aTransportTwo.writableEnded, true)
                done()
            })

        })

    })

    describe("destroy", function() {

        it(`should destroy all piped transports`, function() {
            const aTransportOne = new TransportMock()
            const aTransportTwo = new TransportMock()

            const aLogger = new Logger({
                transports: [ aTransportOne, aTransportTwo ]
            })

            aLogger.destroy()

            assert.strictEqual(aTransportOne.destroyed, true)
            assert.strictEqual(aTransportTwo.destroyed, true)
        })

    })
    
    
})