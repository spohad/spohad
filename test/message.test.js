const assert = require("node:assert")
const { describe, it } = require('node:test');
const { LoggerMessage } = require(`../lib/message.js`);

class FormatterMock {

    format() {
        return 'bar'
    }

}

describe("LoggerMessage", function() {

    describe("constructor", function() {

        it("should assign multiple objects to the message", function() {
            const aMessage = new LoggerMessage(undefined, { foo: "bar" }, { bar: "foo" })

            assert.deepEqual(aMessage, { foo: 'bar', bar: 'foo' })
        })

        it("should keep last key value if the same key is present between multiple objects", function() {
            const aMessage = new LoggerMessage(undefined, { foo: "bar" }, { bar: "foo" }, { foo: "baz" })

            assert.deepEqual(aMessage, { foo: 'baz', bar: 'foo' })
        })

    })

    describe("toString()", function() {

        it("should call provided formatter during serialization", function(t) {
            const expected = 'foo'
            const aFormatter = new FormatterMock()
            const aMessage = new LoggerMessage(aFormatter)

            const aSerializationMock = t.mock.method(aFormatter, 'format', () => expected)

            assert.strictEqual(aMessage.toString(), expected)
            assert.strictEqual(aSerializationMock.mock.callCount(), 1)
        })

    })

})