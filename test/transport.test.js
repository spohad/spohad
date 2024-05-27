const assert = require("node:assert")
const { describe, it } = require('node:test');
const { LoggerTransport } = require(`../lib/transport.js`)
const { crit, debug } = require("../lib/levels.js")

class WritableTransport extends LoggerTransport {

    constructor(options) {
        super(options)
    }

    _write() {}

}

describe("LoggerTransport", function() {

    describe("constructor", function() {

        it("should set the transport levels throught contructor", function() {
            const levels = [debug, crit]
            const aTransport = new LoggerTransport({ levels })

            assert.deepStrictEqual(aTransport.levels, levels)
        })

        it("should set the writable options throught contructor", function() {
            const aTransport = new LoggerTransport({ objectMode: true })

            assert.deepStrictEqual(aTransport.writableObjectMode, true)
        })

    })

    describe("levels", function() {

        it("should set levels to the transport", function() {
            const levels = [ debug.name, crit.name ]
            const aTransport = new LoggerTransport()
            aTransport.levels = levels

            assert.deepStrictEqual(aTransport.levels, levels)
        })

        it("should set single level as array of levels", function() {
            const levels = crit.name
            const aTransport = new LoggerTransport()
            aTransport.levels = levels

            assert.deepStrictEqual(aTransport.levels, [ levels ])
        })
        
    })

    describe("write()", function() {

        it("should write message", function(t, done) {
            const aMessage = 'foo'
            const aTransport = new WritableTransport()

            t.mock.method(aTransport, "_write", (data, encoding, callback) => {
                assert.strictEqual(data.toString(), aMessage)
                return done()
            })
        
            aTransport.write(aMessage)

        })

        it("should serialize message before writing", function(t, done) {
            const aMessage = 123
            const aTransport = new WritableTransport()

            t.mock.method(aTransport, "_write", (data, encoding, callback) => {
                assert.strictEqual(data.toString(), String(aMessage))
                return done()
            })
        
            aTransport.write(aMessage)

        })

    })

})