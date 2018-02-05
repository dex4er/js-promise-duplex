'use strict'

const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')

class PromiseDuplex extends PromiseReadable /* and PromiseWritable */ {
  constructor (stream) {
    super(stream)
    this.readable = new PromiseReadable(stream)
    this.writable = new PromiseWritable(stream)
    this._isPromiseDuplex = true
  }

  // PromiseReadable
  read (size) {
    return this.readable.read(size)
  }

  readAll () {
    return this.readable.readAll()
  }

  setEncoding (encoding) {
    this.readable.setEncoding(encoding)
    return this
  }

  // PromiseWritable
  write (chunk, encoding) {
    return this.writable.write(chunk, encoding)
  }

  writeAll (content, chunkSize) {
    return this.writable.writeAll(content, chunkSize)
  }

  end () {
    return this.writable.end()
  }

  // PromiseDuplex
  once (event) {
    const stream = this.stream

    return new Promise((resolve, reject) => {
      if (this.readable._errored) {
        const err = this.readable._errored
        delete this.readable._errored
        return reject(err)
      }

      if (this.writable._errored) {
        const err = this.writable._errored
        delete this.writable._errored
        return reject(err)
      }

      if (stream.closed) {
        if (event === 'close') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after close`))
        }
      }

      if (stream.destroyed) {
        if (event === 'close' || event === 'end' || event === 'finish') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after destroy`))
        }
      }

      const eventHandler = event !== 'end' && event !== 'finish' && event !== 'error' ? argument => {
        removeListeners()
        resolve(argument)
      } : undefined

      const closeHandler = () => {
        removeListeners()
        resolve()
      }

      const endHandler = event !== 'close' ? () => {
        removeListeners()
        resolve()
      } : undefined

      const errorHandler = (err) => {
        delete this.readable._errored
        delete this.writable._errored
        removeListeners()
        reject(err)
      }

      const finishHandler = event !== 'close' ? () => {
        removeListeners()
        resolve()
      } : undefined

      const removeListeners = () => {
        if (eventHandler) {
          stream.removeListener(event, eventHandler)
        }
        stream.removeListener('close', closeHandler)
        if (endHandler) {
          stream.removeListener('end', endHandler)
        }
        stream.removeListener('error', errorHandler)
        if (finishHandler) {
          stream.removeListener('finish', finishHandler)
        }
      }

      if (eventHandler) {
        stream.on(event, eventHandler)
      }
      stream.on('close', closeHandler)
      if (endHandler) {
        stream.on('end', endHandler)
      }
      if (finishHandler) {
        stream.on('finish', finishHandler)
      }
      stream.on('error', errorHandler)
    })
  }

  destroy () {
    if (this.readable) {
      this.readable.destroy()
      delete this.readable
    }
    if (this.writable) {
      this.writable.destroy()
      delete this.writable
    }
  }
}

PromiseDuplex.PromiseDuplex = PromiseDuplex
PromiseDuplex.default = PromiseDuplex

module.exports = PromiseDuplex
