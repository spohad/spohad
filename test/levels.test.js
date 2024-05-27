const assert = require("node:assert")
const { describe, it } = require('node:test');
const { LoggerLevel } = require("../lib/level.js")
const { emerg, alert, crit, error, warn, note, info, debug } = require("../lib/levels.js")

describe("LoggerLevel", function() {

    describe("name", function() {

        it("should set the level name through the constructror", function() {
            const expected = 'info'
            const aLevel = new LoggerLevel(expected)
            assert.deepEqual(aLevel.name, expected)
        })

        it("should not set the level name through sette", function() {
            const expected = 'info'
            const aLevel = new LoggerLevel(expected)

            aLevel.name = 'emerg'

            assert.deepEqual(aLevel.name, expected)
        })

    })

    describe("code", function() {

        it("should set the level code through the constructror", function() {
            const expected = 10
            const aLevel = new LoggerLevel('info', expected)
            assert.deepEqual(aLevel.code, expected)
        })

        it("should not set the level code through setter", function() {
            const expected = 10
            const aLevel = new LoggerLevel('info', expected)

            aLevel.code = 20

            assert.deepEqual(aLevel.code, expected)
        })

    })

    describe("color", function() {

        it("should set the level color through the constructror", function() {
            const expected = "\u001b[33;1m"
            const aLevel = new LoggerLevel('info', 10, expected)
            assert.deepEqual(aLevel.color, expected)
        })

        it("should not set the level color through setter", function() {
            const expected = "\u001b[33;1m"
            const aLevel = new LoggerLevel('info', 10, expected)

            aLevel.color = "\u001b[31;1m"

            assert.deepEqual(aLevel.color, expected)
        })

    })

    it("should return the level name string when toString() is callled", function() {
        const expected = 'info'
        const aLevel = new LoggerLevel(expected, 10, "\u001b[33;1m")
        assert.deepEqual(aLevel.toString(), expected)
    })

})

describe("emerg", function() {

    it("should set the level name", function() {
        const expected = "emerg"
        assert.deepEqual(emerg.name, expected)
    })

    it("should set the level code", function() {
        const expected = 0
        assert.deepEqual(emerg.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[33;1m"
        assert.deepEqual(emerg.color, expected)
    })

})

describe("alert", function() {

    it("should set the level name", function() {
        const expected = "alert"
        assert.deepEqual(alert.name, expected)
    })

    it("should set the level code", function() {
        const expected = 1
        assert.deepEqual(alert.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[33m"
        assert.deepEqual(alert.color, expected)
    })

})

describe("crit", function() {

    it("should set the level name", function() {
        const expected = "crit"
        assert.deepEqual(crit.name, expected)
    })

    it("should set the level code", function() {
        const expected = 2
        assert.deepEqual(crit.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[31;1m"
        assert.deepEqual(crit.color, expected)
    })

})

describe("error", function() {

    it("should set the level name", function() {
        const expected = "error"
        assert.deepEqual(error.name, expected)
    })

    it("should set the level code", function() {
        const expected = 3
        assert.deepEqual(error.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[31m"
        assert.deepEqual(error.color, expected)
    })

})

describe("warn", function() {

    it("should set the level name", function() {
        const expected = "warn"
        assert.deepEqual(warn.name, expected)
    })

    it("should set the level code", function() {
        const expected = 4
        assert.deepEqual(warn.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[31m"
        assert.deepEqual(warn.color, expected)
    })

})

describe("note", function() {

    it("should set the level name", function() {
        const expected = "note"
        assert.deepEqual(note.name, expected)
    })

    it("should set the level code", function() {
        const expected = 5
        assert.deepEqual(note.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[35m"
        assert.deepEqual(note.color, expected)
    })

})

describe("info", function() {

    it("should set the level name", function() {
        const expected = "info"
        assert.deepEqual(info.name, expected)
    })

    it("should set the level code", function() {
        const expected = 6
        assert.deepEqual(info.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[0m"
        assert.deepEqual(info.color, expected)
    })

})

describe("debug", function() {

    it("should set the level name", function() {
        const expected = "debug"
        assert.deepEqual(debug.name, expected)
    })

    it("should set the level code", function() {
        const expected = 7
        assert.deepEqual(debug.code, expected)
    })

    it("should set the level color", function() {
        const expected = "\u001b[34m"
        assert.deepEqual(debug.color, expected)
    })

})