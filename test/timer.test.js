const assert = require("node:assert")
const { describe, it } = require('node:test');
const { LoggerTimer } = require("../lib/timer.js")

function round(number) {
    const str = String(number)
    return parseInt(str.substring(0, str.length-1) + '0')
}

describe("LoggerTimer", function() {

    describe(`callback`, function(t, done) {

        it(`should set the timer callback`, function(t) {
            const aCallback = t.mock.fn()
            const aTimer = new LoggerTimer(aCallback, "mm")
    
            assert.strictEqual(aTimer.callback, aCallback)
        })
    
        it(`should throw an error when callback is not type of function`, function(t) {
            assert.throws(() => new LoggerTimer({}, "mm"), { message: "Timer callback should be a function." })
        })

    })

    describe(`delay`, function(t, done) {

        it(`should set the timer delays`, function(t) {
            const aCallback = t.mock.fn()
            assert.doesNotThrow(() => [ "MM", "dd", "HH", "mm", "ss" ].forEach(delay => new LoggerTimer(aCallback, delay)))
        })
    
        it(`should throw an error when delay is invalid`, function(t) {
            const aCallback = t.mock.fn()
            assert.throws(() => new LoggerTimer(aCallback, "foo"), { message: "Timer delay is not found." })
        })
        
    })

    it("should call callback after defined delay", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "ss")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setSeconds(aRotationTime.getSeconds() + 1, 0)

        setTimeout(() => {
            aTimer.stop()
            assert.strictEqual(aCallback.mock.callCount(), 2)
            done()
        }, (aRotationTime.getTime() - aNowTime.getTime()) + 1010) 
    })

    it("should stop callback execution after stop", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "ss")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setSeconds(aRotationTime.getSeconds() + 1, 0)

        aTimer.stop()

        setTimeout(() => {
            assert.strictEqual(aCallback.mock.callCount(), 0)
            done()
        }, (aRotationTime.getTime() - aNowTime.getTime()) + 1010)

    })

    it("should set delay to the next month", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "MM")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setMonth(aRotationTime.getMonth() + 1, 1)
        aRotationTime.setUTCHours(0, 0, 0, 0)

        assert.strictEqual(round(aRotationTime.getTime() - aTimer.timer._idleTimeout), round(aNowTime.getTime()))
        assert.strictEqual(aCallback.mock.callCount(), 0)

        aTimer.stop()
        done()
    })

    it("should set delay to the next day", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "dd")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setUTCDate(aRotationTime.getDate() + 1)
        aRotationTime.setUTCHours(0, 0, 0, 0)

        assert.strictEqual(round(aRotationTime.getTime() - aTimer.timer._idleTimeout), round(aNowTime.getTime()))
        assert.strictEqual(aCallback.mock.callCount(), 0)

        aTimer.stop()

        done()
    })

    it("should set delay to the next hour", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "HH")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setHours(aRotationTime.getHours() + 1, 0, 0, 0)

        assert.strictEqual(round(aRotationTime.getTime() - aTimer.timer._idleTimeout), round(aNowTime.getTime()))
        assert.strictEqual(aCallback.mock.callCount(), 0)

        aTimer.stop()

        done()
    })

    it("should set delay to the next minute", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "mm")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setMinutes(aRotationTime.getMinutes() + 1, 0, 0)

        assert.strictEqual(round(aRotationTime.getTime() - aTimer.timer._idleTimeout), round(aNowTime.getTime()))
        assert.strictEqual(aCallback.mock.callCount(), 0)

        aTimer.stop()

        done()
    })
    
    it("should set delay to the next second", function(t, done) {
        const aCallback = t.mock.fn()
        const aTimer = new LoggerTimer(aCallback, "ss")
        const aNowTime = new Date()
        const aRotationTime = new Date(aNowTime)

        aTimer.start()

        aRotationTime.setSeconds(aRotationTime.getSeconds() + 1, 0)

        assert.strictEqual(round(aRotationTime.getTime() - aTimer.timer._idleTimeout), round(aNowTime.getTime()))
        assert.strictEqual(aCallback.mock.callCount(), 0)

        aTimer.stop()

        done()
    })

})