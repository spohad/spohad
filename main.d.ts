declare module "spohad" {
    import { EventEmitter } from "events"
    import { Readable, Writable, WritableOptions } from "stream"

    type Message = { [key: string]: any }
    type LoggerFormatterHandler = (key: string, value: any) => string

    export class LoggerLevel {
        /**
         * The `name` describes the name of the current level.
         */
        readonly name: string
        /**
         * The `code` identifies code of this level.
         */
        readonly code: number
        /**
         * The `color` defines the color of the message on the terminal by the default console transport.
         */
        readonly color?: string
        constructor(name: string, code: number, color?: string)
    }
    
    export class LoggerFormatter {
        /**
         * The `template` sets or gets current message template.
         */
        template: string
        constructor(template?: string, handlers?: { [key: string]: LoggerFormatterHandler })
        /**
         * The `set()` method set handler for the template identifier. 
         * 
         * @param key template identifier.
         * @param handler identifier handler.
         */ 
        set(key: string, handler: LoggerFormatterHandler): this
        /**
         * The `get()` method get handler for the template identifier. 
         * 
         * @param key template identifier.
         */
        get(key: string): LoggerFormatterHandler | undefined
        /**
         * The `has()` method check if handler with provided identifier is present. 
         * 
         * @param key template identifier.
         */
        has(key: string): boolean
        /**
         * The `delete()` method delete handler with provided identifier from the formatter. 
         * 
         * @param key template identifier.
         */
        delete(key: string): void 
        /**
         * The `format()` method format message to the current formatter template.
         */    
        format(message: Message): string
    }

    interface LoggerOptions {
        /**
         * The `name` option, in addition to the logger name, also sets the `pub` context property.
         */
        name?: string
        /**
         * The `context` option contain the logger context.
         */
        context?: Object
        /**
         * The `formatter` option contain {@link LoggerFormatter} which will be used under message formatting. 
         */
        formatter?: LoggerFormatter
        /**
         * The `transports` option pipe provided {@link LoggerTransport} instance or instances to the logger.
         */
        transports?: LoggerTransport | LoggerTransport[]
    }

    interface LoggerContext {
        /**
         * Current publisher.
         */
        pub: any
        /**
         * Current process pid.
         */
        procid: number, 
        /**
         * Current version.
         * 
         * @default 1
         */
        version: 1, 
        /**
         * Current system hostname.
         * 
         * @default 1
         */
        hostname: string
    }

    export class Logger<C = LoggerContext> extends EventEmitter {
        /**
         * The `name` option, return current logger name.
         */
        readonly name: string
        /**
         * The `formatter` option contain {@link LoggerFormatter} which will be used under message formatting.
         */
        readonly formatter: LoggerFormatter
        /**
         * The `context` option contain the logger context.
         */
        readonly context: C
        constructor(options?: LoggerOptions)
        /**
         * The `info()` method writes a message with the `info` level.
         * @param message Message argument.
         * @param context Optional context argument.
         */
        info(message: Message): this
        /**
         * The `error()` method writes a message with the `error` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        error(message: Message): void
        /**
         * The `alert()` method writes a message with the `alert` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        alert(message: Message): void
        /**
         * The `debug()` method writes a message with the `debug` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        debug(message: Message): void
        /**
         * The `note()` method writes a message with the `note` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        note(message: Message): void
        /**
         * The `warn()` method writes a message with the `warn` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        warn(message: Message): void
        /**
         * The `crit()` method writes a message with the `crit` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        crit(message: Message): void
        /**
         * The `emerg()` method writes a message with the `emerg` level.
         *
         * @param message Message argument.
         * @param context Optional context argument.
         * @return Undefined.
         */
        emerg(message: Message): void
        /**
         * The `log()` method sends a message to the transport with the specified level.
         * @param message Actual message.
         * @param levels Message level.
         */
        log(level: LoggerLevel, message: Message): this
        /**
         * The `pipe()` method adds a transport to the logger instance, allowing it to receive logger messages.
         * 
         * If transport isn\`t instance of {@link LoggerTransport} method will throw an Error.
         */
        pipe(transport: LoggerTransport): LoggerTransport
        /**
         * The `unpipe()` method remove provided {@link LoggerTransport} instance from to the logger.
         */
        unpipe(transport: LoggerTransport): this
        /**
         * The `end()` method ends all piped transports.
         * 
         * @param callback callback that will be called when the transports have completed internal processes, such as issuing remaining data to the output, etc.
         */
        end(callback?: () => any): void
        /**
         * The `destroy()` method destroy all piped transports.
         */
        destroy(): void
    }

    interface LoggerTransportOptions extends WritableOptions {
        /**
         * The `levels` property contain the transport levels names.
         */
        levels: string | string[]
    }

    export class LoggerTransport extends Writable {
        /**
         * The `levels` options contain current array of the logger levels names.
         */
        levels: string | string[]
        constructor(options: LoggerTransportOptions) 
    }

    interface LoggerConsoleTransportOptions extends LoggerTransportOptions {
        /**
         * The `paint` option defines is should message has been painted.
         */
        paint: boolean
    }

    export class LoggerConsoleTransport extends LoggerTransport {
        /**
         * The `paint` option defines is should message has been painted.
         */
        paint: boolean
        constructor(options?: LoggerConsoleTransportOptions) 
    }

    interface LoggerFileTransportOptions extends LoggerTransportOptions {
        /** 
         * The `compress` option indicates whether the file should be compressed or not.
         */
        compress?: boolean
        /** 
         * The `fileSizeLimit` option sets the file size limit.
         * 
         * This property indicate the limit after which the rotation will be performed. 
         * 
         * File size could be number in bytes or human readable format.
         */
        fileSizeLimit?: number | string
        /** 
         * The `fileSizeLimit` option sets the rotation time for the file. 
         * 
         * Accepts values in date format identifiers i.e. "MM" - month, "dd" - day, "HH" - hour, "mm" - minute.
         */
        fileTimeLimit?: number | string
        /** 
         * The `fileDateTemplate` option defines current transport filename timestamp template. 
         * 
         * This property will be used when creating the log file, namely when creating the file name.
         * 
         * By default it is `yyyy-MM-dd-hh`.
         */ 
        fileDateTemplate?: string
        /** 
         * The `saveRotationFile` option determines whether the file should be saved or deleted after the rotation.
         */ 
        saveRotationFile?: boolean
    }

    export class LoggerFileTransport extends LoggerTransport {
        /** 
         * The `fd` return current file descriptor.
         */
        readonly fd: number
        /** 
         * The `path` option is path to the file the stream is writing.
         */
        readonly path: string   
        /** 
         * The `compress` option indicates whether the file should be compressed or not.
         */
        readonly compress: true
        /**
         * The `bytesWritten` is bytes written so far. Does not include data that is still queued
         * for writing.
         */
        readonly bytesWritten: number
        constructor(dir: string, filename: string, options?: LoggerFileTransportOptions) 
        addListener(event: "close", listener: () => void): this;
        addListener(event: "drain", listener: () => void): this;
        addListener(event: "error", listener: (err: Error) => void): this;
        addListener(event: "finish", listener: () => void): this;
        addListener(event: "open", listener: (fd: number) => void): this;
        addListener(event: "pipe", listener: (src: Readable) => void): this;
        addListener(event: "ready", listener: () => void): this;
        addListener(event: "unpipe", listener: (src: Readable) => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;
        on(event: "close", listener: () => void): this;
        on(event: "drain", listener: () => void): this;
        on(event: "error", listener: (err: Error) => void): this;
        on(event: "finish", listener: () => void): this;
        on(event: "open", listener: (fd: number) => void): this;
        on(event: "pipe", listener: (src: Readable) => void): this;
        on(event: "ready", listener: () => void): this;
        on(event: "unpipe", listener: (src: Readable) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        once(event: "close", listener: () => void): this;
        once(event: "drain", listener: () => void): this;
        once(event: "error", listener: (err: Error) => void): this;
        once(event: "finish", listener: () => void): this;
        once(event: "open", listener: (fd: number) => void): this;
        once(event: "pipe", listener: (src: Readable) => void): this;
        once(event: "ready", listener: () => void): this;
        once(event: "unpipe", listener: (src: Readable) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;
        prependListener(event: "close", listener: () => void): this;
        prependListener(event: "drain", listener: () => void): this;
        prependListener(event: "error", listener: (err: Error) => void): this;
        prependListener(event: "finish", listener: () => void): this;
        prependListener(event: "open", listener: (fd: number) => void): this;
        prependListener(event: "pipe", listener: (src: Readable) => void): this;
        prependListener(event: "ready", listener: () => void): this;
        prependListener(event: "unpipe", listener: (src: Readable) => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "close", listener: () => void): this;
        prependOnceListener(event: "drain", listener: () => void): this;
        prependOnceListener(event: "error", listener: (err: Error) => void): this;
        prependOnceListener(event: "finish", listener: () => void): this;
        prependOnceListener(event: "open", listener: (fd: number) => void): this;
        prependOnceListener(event: "pipe", listener: (src:Readable) => void): this;
        prependOnceListener(event: "ready", listener: () => void): this;
        prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

    }
 
}