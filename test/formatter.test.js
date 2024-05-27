const assert = require("node:assert")
const { describe, it } = require('node:test');
const util = require("util")
const { randomUUID } = require("node:crypto");
const { crit } = require("../lib/levels.js");
const { LoggerFormatter, priority, timestamp, sd } = require("../lib/formatter.js");


const FORMATTER_TEMPLATE = "<%pri%> %version% %timestamp% %hostname% %app_name% %procid% %msgid% %sd% %msg%\n"

const TEST_CONTENT = {
    id: randomUUID(),
    text: "text", 
    number: 123, 
    object: { foo: "bar" }, 
    timestamp: new Date().toISOString(),
    bInt: BigInt(100)
}

describe("prioirty", function() {

    it("should calculate message priority based on faqcility and level", function() {
        const aMessage = { facility: 2, level: crit }
        assert.strictEqual(priority(aMessage), 18)
    })

    it("should should use 1 as facility if it doesnt present", function() {
        const aMessage = { level: crit }
        assert.strictEqual(priority(aMessage), 10)
    })

})

describe("timestamp", function() {

    it("should return new timestamp if it is not present", function() {
        const currTimestamp = new Date().toISOString()
        const dataTimestamp = timestamp({})
        assert.strictEqual(dataTimestamp.substring(0, dataTimestamp.indexOf('.')), currTimestamp.substring(0, currTimestamp.indexOf('.')))
    })

    it("should convert Date timestamp to ISO string", function() {
        const aTimestamp = new Date()
        const aMessage = { timestamp: aTimestamp  }

        assert.strictEqual(timestamp(aMessage), aTimestamp.toISOString())
    })

    it("should return the timestamp as is if it is present and not a Date instance", function() {
        const aTimestamp = new Date().toISOString()
        const aMessage = { timestamp: aTimestamp  }

        assert.strictEqual(timestamp(aMessage), aTimestamp)
    })

})

describe("sd", function() {

    it(`should serialize structure data`, function() {
        const aSD = TEST_CONTENT
        const aMessage = { sd: TEST_CONTENT }

        assert.strictEqual(
            sd(aMessage), `[${aSD.id} text="${aSD.text}" number="${aSD.number}" object="${util.format(aSD.object)}" timestamp="${aSD.timestamp}" bInt="100n"]`
        )
    })

    it(`should escape structure data double quotes`, function() {
        const aSD = { id: randomUUID(), text: '"text"' }
        const aMessage = { sd: aSD }

        assert.strictEqual(sd(aMessage), `[${aSD.id} text="\\"text\\""]`)
    })

    it(`should escape structure data square brackets`, function() {
        const aSD = { id: randomUUID(), text: '[text]' }
        const aMessage = { sd: aSD  }

        assert.strictEqual(sd(aMessage), `[${aSD.id} text="\\[text\\]"]`)
    })

    it(`should serialize multiple structure datas`, function() {
        const aSD = { id: randomUUID(), ...TEST_CONTENT, dQuotes: '"text"', sBrackets: "[text]" }
        const aMessage = { sd: [ aSD, aSD ] }

        assert.strictEqual(
            sd(aMessage), 
            `[${aSD.id} text="${aSD.text}" number="${aSD.number}" object="${util.format(aSD.object)}" timestamp="${aSD.timestamp}" bInt="100n" dQuotes="\\"text\\"" sBrackets="\\[text\\]"][${aSD.id} text="${aSD.text}" number="${aSD.number}" object="${util.format(aSD.object)}" timestamp="${aSD.timestamp}" bInt="100n" dQuotes="\\"text\\"" sBrackets="\\[text\\]"]`
        )

    })

    it(`should throw an error when structure data is not type of object`, function() {
        const aMessage = { sd: 'foo' }

        assert.throws(_ => sd(aMessage), { message: "Message structure data should be type of object." })
    })

    it(`should throw an error when structure data id is not defined`, function() {
        const aMessage = { sd: { data: 'foo' } }

        assert.throws(_ => sd(aMessage), { message: 'Message structure data "id" is not defined.' })
    })

})

describe("LoggerFormatter", function() {

    describe("template", function() {

        it("should set the formatter template", function(t) {
            const aTemplate = "%foo%"
            const aFormatter = new LoggerFormatter(aTemplate)

            aFormatter.template = aTemplate

            assert.deepStrictEqual(aFormatter.template, aTemplate)
        })
                            
        it("should set the formatter template through constructor", function(t) {
            const aTemplate = "%foo%"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.deepStrictEqual(aFormatter.template, aTemplate)
        })

        it("should set the default formatter template to the sys log template", function(t) {
            const aFormatter = new LoggerFormatter()

            assert.deepStrictEqual(aFormatter.template, FORMATTER_TEMPLATE)
        })

        it(`should throw an error when template is not type of string`, function() {
            assert.throws(_ => new LoggerFormatter(123), { message: 'Formatter template should be type of string.' })
        })

    })

    describe("set()", function() {

        it("should set handler to the formatter", function(t) {
            const aHandler = t.mock.fn()
            const aFormatter = new LoggerFormatter()

            aFormatter.set('key', aHandler)

            assert.ok(aFormatter.has('key'))
        })

        it("should set handlers through constructor", function(t) {
            const aHandler = t.mock.fn()
            const aFormatter = new LoggerFormatter("foo", { key: aHandler })

            assert.ok(aFormatter.has('key'))
        })

        it("should throw an error when handler is not type of function", function(t) {
            const aHandler = 'foo'
            const aFormatter = new LoggerFormatter()

            assert.throws(_ => aFormatter.set('key', aHandler), { message: 'Formatter handler should be type of function.' })
        })

    })

    describe("has()", function() {

        it("should return boolean value indicates if handler with provided key is present", function(t) {
            const aHandler = t.mock.fn()
            const aFormatter = new LoggerFormatter()

            assert.strictEqual(aFormatter.has("key"), false)
            aFormatter.set('key', aHandler)
            assert.strictEqual(aFormatter.has("key"), true)
        })

    })

    describe("get()", function() {

        it("should get handler to the formatter", function(t) {
            const aHandler = t.mock.fn()
            const aFormatter = new LoggerFormatter()

            aFormatter.set('key', aHandler)

            assert.strictEqual(aFormatter.get('key'), aHandler)
        })

    })

    describe("delete()", function() {

        it("should delete handler and its key from the formatter", function(t) {
            const aHandler = t.mock.fn()
            const aFormatter = new LoggerFormatter()

            aFormatter.set('key', aHandler)
            assert.strictEqual(aFormatter.has("key"), true)

            aFormatter.delete("key")
            assert.strictEqual(aFormatter.has("key"), false)

        })

    })

    describe("format()", function() {
                
        it("should replace the template key to the result of formatter handler that matches it", function(t) {
            const aPayload = {}
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate, { foo: function() { return 'bar' }, bar: function() { return 'foo' } })
    
            assert.strictEqual(aFormatter.format(aPayload), "<bar>")
        })

        it("should replace the template key to the serialized message value that matches it if no handler is provided", function(t) {
            const aPayload = { foo: "bar", bar: "foo", bar: "baz" }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), "<bar>")
        })

        it("should serialize message number value", function() {
            const aPayload = { foo: 123 }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), "<123>")
        })

        it("should serialize message BigInt value", function() {
            const aPayload = { foo: BigInt(123) }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), `<${util.format(aPayload.foo)}>`)
        })

        it("should serialize message object value", function() {
            const aPayload = { foo: { bar: "baz" } }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), `<${util.format(aPayload.foo)}>`)
        })

        it("should serialize message Date value", function() {
            const aPayload = { foo: new Date() }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), `<${util.format(aPayload.foo)}>`)
        })

        it("should serialize message function value", function() {
            const aPayload = { foo: function() {} }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), `<${util.format(aPayload.foo)}>`)
        })

        it("should serialize handler result", function() {
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate, { foo: function() { return 123 } })

            assert.strictEqual(aFormatter.format({}), "<123>")
        })

        it("should set \"-\" if provided value is null or undefined", function() {
            const aPayload = { foo: undefined }
            const aTemplate = "<%foo%>"
            const aFormatter = new LoggerFormatter(aTemplate)

            assert.strictEqual(aFormatter.format(aPayload), "<->")
        })

    })

})