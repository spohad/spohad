'use strict'

const fs = require("fs");
const path = require("path");
const byteFormat = require("bytes")
const dateFormat = require("date-format")
const { gzip } = require("zlib");
const { LoggerTimer } = require("../timer.js")
const { LoggerTransport } = require("../transport.js");

const kFs = Symbol('kFs')
const kIoDone = Symbol('kIoDone');
const kRotation = Symbol('kRotation')
const kRotationDone = Symbol('kRotationDone')
const kIsPerformingIO = Symbol('kIsPerformingIO');

class FileChannelMessageSizeError extends Error {
    constructor() {
        super("File Channel message size exceed defined file size limit.")
    } 
}

class FileChannelMessageWriteError extends Error {
    constructor() {
        super("File Channel message send failed.")
    } 
}

class LoggerFileTransport extends LoggerTransport  {
    
    constructor(dir, namespace, options = {}) {
        super({ emitClose: true, levels: options.levels })
        const dirPath = path.join(process.cwd(), dir)

        if(!fs.existsSync(dirPath)) 
            fs.mkdirSync(dirPath, { recursive: true })

        this._fd = undefined
        this._dir = dir
        this._path = undefined
        this._namespace = namespace 

        this._compress = options.compress || false
        this._bytesWritten = 0

        this._fileRotation = false
        this._fileCreatedAt = undefined
        this._fileDateTemplate = options.fileDateTemplate || "yyyy-MM-dd-hh"
        this._fileRotationSize = undefined
        this._fileRotationTime = options.fileTimeLimit
        this._fileRotationTimer = undefined
        this._saveRotationFile = options.saveRotationFile

        this[kFs] = fs
        this[kRotation] = false

        if(options.fileSizeLimit) 
            this._fileRotationSize = byteFormat.parse(options.fileSizeLimit)

    }

    get fd() {
        return this._fd
    }

    get path() {
        return this._path
    }

    get compress() {
        return this._compress
    }

    get bytesWritten() {
        return this._bytesWritten
    }

    _construct(callback) {
        this._createFile((error, fd) => {

            if(error != null)
                return callback(error)

            this._fd = fd

            this.emit('open', fd);
            this.emit("ready");

            if(this._fileRotationTime != null) {
                this._fileRotationTimer = new LoggerTimer(() => this._rotateFile(), this._fileRotationTime)
                this._fileRotationTimer.start()
            }

            callback(error)
        })
    }

    _write(chunk, encoding, callback) {
        this[kIsPerformingIO] = true;

        const send = (chunk, next) => {

            const aMessageSize = Buffer.byteLength(chunk)
            const aPendingSize = this._bytesWritten + aMessageSize
    
            if(this._fileRotationSize != null) {
    
                if(aMessageSize > this._fileRotationSize) 
                    return next(new FileChannelMessageSizeError())
    
                if(aPendingSize > this._fileRotationSize) 
                    this._rotateFile()
    
            }

            const write = (chunk, size, retries, next) => {
                return this[kFs].write(this.fd, chunk, 0, size, (error, bytesWritten, buffer) => {

                    if (error != null && error.code === 'EAGAIN') {
                        error = null;
                        bytesWritten = 0;
                    }
        
                    if (error != null) 
                        return next(error);
                
                    this._bytesWritten += bytesWritten;
                
                    retries = bytesWritten ? 0 : retries + 1;
                    size -= bytesWritten;

                    if (retries > 5) 
                        next(new FileChannelMessageWriteError());
                    else if (size) 
                        write(buffer.slice(bytesWritten), size, retries, next)
                    else 
                        next();
        
                });
            }

            if(this[kRotation]) 
                return this.once(kRotationDone, (error) => error != null ? next(error) : send(chunk, next))
            else
                return write(chunk, aMessageSize, 0, next)

        }

        return ((callback) => !this._compress ? 
            send(chunk, callback) : 
            gzip(chunk, (err, data) => err != null ? callback(err) : send(data, callback)
        ))((error) => {
            this[kIsPerformingIO] = false;

            if (this.destroyed) {
                callback(error);
                return this.emit(kIoDone, error);
            }
    
            callback(error);
        })

    }

    _final(callback) {

        if(this._fileRotationTimer)
            this._fileRotationTimer.stop()

        this[kRotation] ? 
            this.once(kRotationDone, (error) => error != null ? callback(error) : this._final(callback)) :
            this[kFs].close(this.fd, (error) => {
                this._fd = null; 
                callback(error)
            });

    };
 
    _destroy(error, callback) {

        if(this._fileRotationTimer)
            this._fileRotationTimer.stop()

        return ((callback) => {

            if(this[kIsPerformingIO]) 
                this.once(kIoDone, (err) => callback(error || err));
            else if (this[kRotation])
                this.once(kRotationDone, (err) => callback(error || err));
            else 
                callback(error);

        })((error) => {
            this._fd != null ? 
                this[kFs].close(this._fd, (err) => callback(error || err)) : 
                callback(error)
        })

    };

    _rotateFile() {

        if(this[kRotation])
            return

        this._bytesWritten = 0
        this[kRotation] = true;

        return ((callback) => this[kFs].close(this.fd, (error) => {

            if(error != null)
                return callback(error)

            if(this._saveRotationFile)
                return this._createFile(callback)

            fs.unlink(this.path, (error) => error != null ?
                callback(error) : this._createFile(callback)
            )

        }))((error, fd) => {

            if(fd != null)
                this._fd = fd

            if(error != null && !this.listenerCount(kRotationDone)) 
                this.destroy(error)

            this[kRotation] = false
            this.emit(kRotationDone, error)

        })

    }  

    _createFile(callback) {
        const currTimestamp = new Date()
        const currDateFormat = dateFormat(this._fileDateTemplate, currTimestamp)

        const filename = this._saveRotationFile && this._fileCreatedAt === currDateFormat ?
            `${this._namespace}_${currDateFormat}(${parseInt((this._path.match(/\(([0-9]+)\)(?=\.log|\.gz)/) || [])[1] || 0) + 1})` :
            `${this._namespace}_${currDateFormat}`

        this._fileCreatedAt = currDateFormat

        const dest = this._path = this.compress ?  
            path.join(fs.realpathSync(this._dir), `${filename}.gz`) :
            path.join(fs.realpathSync(this._dir), `${filename}.log`)
        
        this[kFs].open(dest, "w", callback);
        
    }

}

module.exports = { LoggerFileTransport }