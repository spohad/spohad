const assert = require("node:assert")
const { describe, it } = require('node:test');
const { crit, error } = require("../lib/levels.js")
const { LoggerConsoleTransport } = require("../lib/transports/transport.console.js")

class MessageMock {

    constructor(message, level) {
        this.level = level
        this.msg = message
    }

    toString() {
        return String(this.msg)
    }

}

describe("LoggerConsoleTransport", function() {

    describe("constructor", function() {

        it("should set the transport paint", function() {
            const aTransport = new LoggerConsoleTransport({paint: true})
            assert.equal(aTransport.paint, true)
        })

        it(`should set the transport levels`, function() {
            const aTransport = new LoggerConsoleTransport({ levels: error })

            assert.deepStrictEqual(aTransport.levels, [ error ])
        })

    })

    describe("write", function() {
    
        it("should write message to the std out", function(t, done) {
            const aMessage = "Hello World!"
            const aTransport = new LoggerConsoleTransport()
            const expectedMessage = `${"\u001b[0m"}${aMessage}${"\u001b[0m"}`

            t.mock.method(aTransport, "_write", (message) => {
                assert.equal(message, expectedMessage)
                done()
            })

            aTransport.write(aMessage)
        })
        
        it("should paint and write message to the std out", function(t, done) {
            const aMessage = "Hello World!"
            const aTransport = new LoggerConsoleTransport({ paint: true })
            const expectedMessage = `${crit.color}${aMessage}${"\u001b[0m"}`

            t.mock.method(aTransport, "_write", (message) => {
                assert.equal(message, expectedMessage)
                done()
            })
        
            aTransport.write(new MessageMock(aMessage, crit))
        
        })
                   
        it("should set dfefault color if level doesnt have any color", function(t, done) {
            const aMessage = "Hello World!"
            const aTransport = new LoggerConsoleTransport()
            const expectedMessage = `${"\u001b[0m"}${aMessage}${"\u001b[0m"}`

            t.mock.method(aTransport, "_write", (message) => {
                assert.equal(message.toString(), expectedMessage)
                done()
            })

            aTransport.write(new MessageMock(aMessage, {}))
        })

        it("should not pain message if pain option set to false", function(t, done) {
            const aMessage = "Hello World!"
            const aTransport = new LoggerConsoleTransport({ paint: false })

            t.mock.method(aTransport, "_write", (message) => {
                assert.equal(message, aMessage)
                done()
            })

            aTransport.write(aMessage)
        })

    })

})

