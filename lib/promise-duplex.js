'use strict'

const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')

const Promise = require('any-promise')

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
      if (this._errored) {
        return reject(this._errored)
      } else if (this.readable._errored) {
        return reject(this.readable._errored)
      } else if (this.writable._errored) {
        return reject(this.writable._errored)
      } else if (stream.closed) {
        if (event === 'close') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after close`))
        }
      } else if (stream.destroyed) {
        if (event === 'close' || event === 'end' || event === 'finish') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after destroy`))
        }
      }

      const onceEvent = event !== 'end' && event !== 'finish' && event !== 'error' ? argument => {
        stream.removeListener('close', onceClose)
        if (onceEnd) {
          stream.removeListener('end', onceEnd)
        }
        stream.removeListener('error', onceError)
        if (onceFinish) {
          stream.removeListener('finish', onceFinish)
        }
        resolve(argument)
      } : undefined

      const onceClose = () => {
        if (onceEvent) {
          stream.removeListener(event, onceEvent)
        }
        if (onceEnd) {
          stream.removeListener('end', onceEnd)
        }
        stream.removeListener('error', onceError)
        if (onceFinish) {
          stream.removeListener('finish', onceFinish)
        }
        resolve()
      }

      const onceEnd = event !== 'close' ? () => {
        if (onceEvent) {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('close', onceClose)
        stream.removeListener('error', onceError)
        if (onceFinish) {
          stream.removeListener('finish', onceFinish)
        }
        resolve()
      } : undefined

      const onceFinish = event !== 'close' ? () => {
        if (onceEvent) {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('close', onceClose)
        if (onceEnd) {
          stream.removeListener('end', onceEnd)
        }
        stream.removeListener('error', onceError)
        resolve()
      } : undefined

      const onceError = (err) => {
        if (onceEvent) {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('close', onceClose)
        if (onceEnd) {
          stream.removeListener('end', onceEnd)
        }
        if (onceFinish) {
          stream.removeListener('finish', onceFinish)
        }
        this._errored = err
        reject(err)
      }

      if (onceEvent) {
        stream.once(event, onceEvent)
      }
      stream.once('close', onceClose)
      if (onceEnd) {
        stream.once('end', onceEnd)
      }
      if (onceFinish) {
        stream.once('finish', onceFinish)
      }
      stream.once('error', onceError)
    })
  }
}

PromiseDuplex.PromiseDuplex = PromiseDuplex
PromiseDuplex.default = PromiseDuplex

module.exports = PromiseDuplex
