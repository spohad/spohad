'use strict'

class TimerDelayTypeError extends Error {
    constructor() {
        super("Timer delay is not found.")
    }
}

class TimerCallbackTypeError extends Error {
    constructor() {
        super("Timer callback should be a function.")
    }
}

class LoggerTimer {
    delay
    timer

    constructor(callback, delay) {

        if(typeof callback !== "function") 
            throw new TimerCallbackTypeError()

        if(![ "MM", "dd", "HH", "mm", "ss" ].includes(delay)) 
            throw new TimerDelayTypeError()

        this.timer = undefined
        this.delay = delay
        this.callback = callback

    }

    stop() {
        clearTimeout(this.timer)
        this.timer = undefined
        return this
    }

    start() {

        const callback = () => {
            this.callback()
            this.timer = setTimeout(callback, this._getDelay())
        }

        if(this.timer == null)
            this.timer = setTimeout(callback, this._getDelay())
    }

    _getDelay() {
        const aUTCTime = new Date()
        const aRotationTime = new Date(aUTCTime)

        switch(this.delay) {
            case("MM"): this._month(aRotationTime); break;
            case("dd"): this._day(aRotationTime); break;
            case("HH"): this._hour(aRotationTime); break;
            case("mm"): this._minute(aRotationTime); break;
            case("ss"): this._second(aRotationTime); break;
        }

        return aRotationTime.getTime() - aUTCTime.getTime()
    }

    _month(aRotationTime) {
        aRotationTime.setMonth(aRotationTime.getMonth() + 1, 1)
        aRotationTime.setUTCHours(0, 0, 0, 0)
    }

    _day(aRotationTime) {
        aRotationTime.setUTCDate(aRotationTime.getDate() + 1)
        aRotationTime.setUTCHours(0, 0, 0, 0)
    }

    _hour(aRotationTime) {
        aRotationTime.setHours(aRotationTime.getHours() + 1, 0, 0, 0)
    }

    _minute(aRotationTime) {
        aRotationTime.setMinutes(aRotationTime.getMinutes() + 1, 0, 0)
    }

    _second(aRotationTime) {
        aRotationTime.setSeconds(aRotationTime.getSeconds() + 1, 0)
    }

}

module.exports = { LoggerTimer }