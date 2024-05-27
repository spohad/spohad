const fs = require(`node:fs`)
const path = require(`node:path`)
const util = require(`node:util`)
const assert = require("node:assert")
const { describe, it } = require('node:test');
const dateFormat = require("date-format")
const { gunzipSync } = require("node:zlib")
const { LoggerFileTransport } = require(`../lib/transports/transport.file.js`);
const { error } = require("../lib/levels.js");

// Enviroment

const TEST_TEMPLATE = `%msg%`
const TEST_MESSAGE = "%s Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar. Neque gravida in fermentum et sollicitudin ac orci. Risus ultricies tristique nulla aliquet enim. Sed turpis tincidunt id aliquet. Id diam vel quam elementum pulvinar. Sit amet tellus cras adipiscing. Pellentesque sit amet porttitor eget dolor. Vestibulum morbi blandit cursus risus at. Diam maecenas ultricies mi eget mauris pharetra et ultrices."

const TEST_DIR = `./test`
const TEST_FILE_NAME = `transport.file.test(test_file)`
const TEST_HOUR_DATE_FORMAT = "yyyy-MM-dd-hh"
const TEST_MINUTE_DATE_FORMAT = "yyyy-MM-dd-hh-mm"
const TEST_SECOND_DATE_FORMAT = "yyyy-MM-dd-hh-mm-ss"
const TEST_NUMBER_SIZE_LIMIT = Buffer.byteLength(TEST_MESSAGE)

// Tests

function getTime(additional = 0) {
    const aUTCTime = new Date()
    const aRotationTime = new Date(aUTCTime)

    aRotationTime.setSeconds(aRotationTime.getSeconds() + 1, 0)

    return (aRotationTime.getTime() - aUTCTime.getTime()) + additional

}

function getPath(filename, ending, template = TEST_HOUR_DATE_FORMAT) {
    return path.join(fs.realpathSync(TEST_DIR), `${filename}_${dateFormat(template, new Date(new Date().toUTCString()))}${ending}`)  
}

describe("LoggerFileTransport", function() {

    describe("constructor", function() {

        it(`should set the transport file path`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)
            const filePath = getPath(TEST_FILE_NAME, ".log")
    
            aTransport.on("ready", () => {
                assert.equal(aTransport.path, filePath)
                aTransport.end(() => fs.unlink(filePath, done))
            })
            
        })
    
        it(`should set the transport file path using fileDateTemplate`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { fileDateTemplate: TEST_MINUTE_DATE_FORMAT })
            const filePath = getPath(TEST_FILE_NAME, ".log", TEST_MINUTE_DATE_FORMAT)
    
            aTransport.on("ready", () => {
                assert.equal(aTransport.path, filePath)
                aTransport.end(() => fs.unlink(filePath, done))
            })
    
        })

        it(`should set the transport levels`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { levels: error })
    
            aTransport.on("ready", () => {
                assert.deepStrictEqual(aTransport.levels, [ error ])
                aTransport.end(() => fs.unlink(aTransport.path, done))
            })
    
        })

    })

    describe("event: ready", function() {

        it(`should be emitted when file is already created`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { levels: error })
    
            aTransport.on("ready", () => {
                assert.strictEqual(fs.existsSync(aTransport.path), true)
                done()
            })
    
        })

    })

    describe("event: open", function() {

        it(`should be emitted when file is already created`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { levels: error })
    
            aTransport.on("open", (fd) => {
                assert.strictEqual(fs.existsSync(aTransport.path), true)
                done()
            })
    
        })

        it(`should be emitted with the file descriptor`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { levels: error })
    
            aTransport.on("open", (fd) => {
                assert.strictEqual(typeof fd, 'number')
                done()
            })
    
        })

    })

    describe(`rotation`, function(t, done) {

        it("should rotate file after some time", function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, {
                fileTimeLimit: "ss", 
                fileDateTemplate: TEST_SECOND_DATE_FORMAT
            })

            aTransport.on("ready", () => {
                const firstFilePath = getPath(TEST_FILE_NAME, ".log", TEST_SECOND_DATE_FORMAT)

                setTimeout(() => {
                    const secondFilePath = getPath(TEST_FILE_NAME, ".log", TEST_SECOND_DATE_FORMAT)
    
                    aTransport.end()
    
                    assert.strictEqual(fs.existsSync(firstFilePath), false)
                    assert.ok(fs.existsSync(secondFilePath))
    
                    fs.unlink(secondFilePath, done)
    
                }, getTime(100))

            })
    
        })

        it(`should create new file rather than delete old one if "saveRotationFile" set to true`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, {
                fileTimeLimit: "ss", 
                saveRotationFile: true, 
                fileDateTemplate: TEST_SECOND_DATE_FORMAT
            })

            aTransport.on('ready', () => {

                const firstFilePath = getPath(TEST_FILE_NAME, ".log", TEST_SECOND_DATE_FORMAT)

                setTimeout(() => {
                    const secondFilePath = getPath(TEST_FILE_NAME, ".log", TEST_SECOND_DATE_FORMAT)
    
                    aTransport.end()
    
                    assert.ok(fs.existsSync(firstFilePath))
                    assert.ok(fs.existsSync(secondFilePath))
    
                    fs.unlinkSync(firstFilePath)
                    fs.unlinkSync(secondFilePath)
    
                    done()
    
                }, getTime(100))

            })

        })

        it(`should create new file with id if new one and old one have same name and "saveRotationFile" set to true`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, {
                fileTimeLimit: "ss", 
                saveRotationFile: true
            })

            aTransport.on("ready", () => {
                const firstFilePath = getPath(TEST_FILE_NAME, ".log")
                const secondFilePath = getPath(TEST_FILE_NAME, "(1).log")
                const thirdFilePath = getPath(TEST_FILE_NAME, "(2).log")

                setTimeout(() => {

                    aTransport.end()
    
                    assert.strictEqual(aTransport.destroyed, false)
                    assert.ok(fs.existsSync(firstFilePath))
                    assert.ok(fs.existsSync(secondFilePath))
                    assert.ok(fs.existsSync(thirdFilePath))
    
                    fs.unlinkSync(firstFilePath)
                    fs.unlinkSync(secondFilePath)
                    fs.unlinkSync(thirdFilePath)
    
                    done()
    
                }, getTime(1100))

            })

        })

        it(`should destroy stream if during rotation occurs an error`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, {
                fileTimeLimit: "ss", 
                saveRotationFile: true
            })

            aTransport.on("error", (error) => {
                assert.strictEqual(error.message, "EBADF: bad file descriptor, close")
                assert.strictEqual(aTransport.destroyed, true)
                fs.unlink(aTransport.path, done)
            })

            aTransport.on("ready", () => fs.closeSync(aTransport.fd))

        })

    })

    describe("write()", function() {

        it(`should write message to the file`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)

            aTransport.write(util.format(TEST_MESSAGE, 0), (error) => {

                if(error)
                    return done(error)

                const filePath = getPath(TEST_FILE_NAME, ".log")
                assert.equal(fs.readFileSync(filePath).toString(), util.format(TEST_MESSAGE, 0))
                aTransport.end(() => fs.unlink(filePath, done))

            })

        })

        it(`should process and write multiple messages to the file`, function(t, done) {
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i))
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                template: TEST_TEMPLATE 
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

            aTransport.end(() => {
                const filePath = getPath(TEST_FILE_NAME, ".log")
                assert.equal(fs.readFileSync(filePath).toString(), aMessages.join(''))
                fs.unlink(filePath, done)
            })

        })

        it(`should write compressed message to the file`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                compress: true, 
            })

            aTransport.write(util.format(TEST_MESSAGE, 0), (error) => {
                const filePath = getPath(TEST_FILE_NAME, ".gz")

                if(error)
                    return done(error)

                assert.equal(gunzipSync(fs.readFileSync(filePath)).toString(), util.format(TEST_MESSAGE, 0))
                aTransport.end(() => fs.unlink(filePath, done))
            })

        })

        it(`should invoke file rotation when file exceeds limits`, function(t, done) {   
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i)) 
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                fileSizeLimit: TEST_NUMBER_SIZE_LIMIT 
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

            aTransport.end(() => {
                const filePath = getPath(TEST_FILE_NAME, ".log")
                assert.equal(fs.readFileSync(filePath).toString(), aMessages.at(-1))
                fs.unlink(filePath, done)
            })

        })

        it(`should invoke file rotation when compression file size exceeds limits`, function(t, done) {   
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i)) 
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                compress: true, 
                fileSizeLimit: TEST_NUMBER_SIZE_LIMIT 
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

            aTransport.end(() => {
                const filePath = getPath(TEST_FILE_NAME, ".gz")
                assert.equal(gunzipSync(fs.readFileSync(filePath)).toString(), aMessages.at(-1))
                fs.unlink(filePath, done)
            })

        })

        it(`should throw an error when message size is exceed limit`, function(t, done) {   
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i)) 
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                fileSizeLimit: 2
            })

            const filePath = getPath(TEST_FILE_NAME, ".log")

            aTransport.on("error", (error) => {
                assert.strictEqual(error.message, "File Channel message size exceed defined file size limit.")
                assert.strictEqual(aTransport.destroyed, true)
                fs.unlink(filePath, done)
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

        })

        it(`should destroy stream if during writing occur an error`, function(t, done) {   
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i)) 
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { 
                template: TEST_TEMPLATE
            })

            const filePath = getPath(TEST_FILE_NAME, ".log")
            
            aTransport.on("ready", () => fs.closeSync(aTransport.fd))

            aTransport.on("error", (error) => {
                assert.strictEqual(error.message, "EBADF: bad file descriptor, write")
                assert.strictEqual(aTransport.destroyed, true)
                fs.unlink(filePath, done)
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

        })

    })

    describe("end()", function(t, done) {
         
        it(`should end the transport and call callback`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)
            
            aTransport.end(() => {
                assert.strictEqual(aTransport.destroyed, false)
                assert.strictEqual(aTransport.writableEnded, true)
                fs.unlink(aTransport.path, done)
            })

        })
                 
        it(`should close the transport fd`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)

            aTransport.on('open', (fd) => 
                aTransport.end(() => {
                    assert.throws(() => fs.closeSync(fd), { message: "EBADF: bad file descriptor, close" })
                    fs.unlink(aTransport.path, done)
                })
            )
    
        })

        it(`should stop the transport rotation timer`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { fileTimeLimit: 'ss', saveRotationFile: true })
            const filePath = getPath(TEST_FILE_NAME, ".log")

            aTransport.end()

            setTimeout(() => {
                assert.strictEqual(fs.existsSync(getPath(TEST_FILE_NAME, "(1).log")), false)
                fs.unlink(filePath, done)
            }, 2000)

        })

        it(`should flush all data to the file before end`, function(t, done) {
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i))
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { saveRotationFile: true })

            const filePath = getPath(TEST_FILE_NAME, ".log")

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])
            
            aTransport.end(() => {
                assert.equal(fs.readFileSync(filePath).toString(), aMessages.join(""))
                assert.equal(aTransport._writableState.pendingcb, 0)
                fs.unlink(filePath, done)
            })

        })

        it(`should handle the transport rotation error during end`, function(t, done) {
            const aMessage = util.format(TEST_MESSAGE, 0)
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, { fileSizeLimit: Buffer.byteLength(aMessage) })
            const filePath = getPath(TEST_FILE_NAME, ".log")

            aTransport.on("error", (error) => {
                assert.strictEqual(error.message, "EBADF: bad file descriptor, close")
                assert.strictEqual(aTransport.destroyed, true)
                fs.unlink(filePath, done)
            })
    
            aTransport.on('open', (fd) => aTransport.write(aMessage, () => {
                fs.closeSync(fd)
                aTransport.end(aMessage)
            }))

        })
        
    })

    describe(`destroy()`, function() {

        it(`should close the transport fd`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)

            aTransport.on('open', (fd) => {

                aTransport.on('close', () => {
                    assert.throws(() => fs.closeSync(fd), { message: "EBADF: bad file descriptor, close" })
                    fs.unlink(aTransport.path, done)
                })

                aTransport.destroy()

            })

        })

        it("should not write rest of data to the file after destroy", function(t, done) {
            const aError = new Error("oops")
            const aMessages = new Array(10).fill(undefined).map((el, i) => util.format(TEST_MESSAGE, i))
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME)

            const filePath = getPath(TEST_FILE_NAME, ".log")

            aTransport.on("error", (error) => {
                assert.strictEqual(error, aError)
                fs.unlink(filePath, done)
            })

            for(let i = 0; i < aMessages.length; i++)
                aTransport.write(aMessages[i])

            setImmediate(() => aTransport.destroy(aError))

        })

        it(`should stop the transport rotation timer`, function(t, done) {
            const aTransport = new LoggerFileTransport(TEST_DIR, TEST_FILE_NAME, {
                fileTimeLimit: 'ss',
                saveRotationFile: true,
            })

            const filePath = getPath(TEST_FILE_NAME, ".log")

            aTransport.destroy()

            setTimeout(() => {
                assert.strictEqual(fs.existsSync(getPath(TEST_FILE_NAME, "(1).log")), false)
                fs.unlink(filePath, done)
            }, 2000)

        })
        
    })

})