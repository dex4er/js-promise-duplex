'use strict'

const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')

const Promise = require('any-promise')

class PromiseDuplex extends PromiseReadable {
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
      if (this.readable._ended || !stream.readable || stream.closed || stream.destroyed) {
        return resolve()
      }

      if (this.writable._errored) {
        return reject(this.writable._errored)
      } else if (this.writable._finished) {
        if (event === 'finish') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after end`))
        }
      }

      const onceEvent = event !== 'end' && event !== 'finish' && event !== 'error' ? argument => {
        stream.removeListener('end', onceEnd)
        stream.removeListener('finish', onceFinish)
        stream.removeListener('error', onceError)
        resolve(argument)
      } : undefined

      const onceEnd = () => {
        if (event !== 'end' && event !== 'finish' && event !== 'error') {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('finish', onceFinish)
        stream.removeListener('error', onceError)
        this.readable._ended = true
        resolve()
      }

      const onceFinish = () => {
        if (event !== 'end' && event !== 'finish' && event !== 'error') {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('end', onceEnd)
        stream.removeListener('error', onceError)
        this.writable._finished = true
        resolve()
      }

      const onceError = e => {
        if (event !== 'end' && event !== 'finish' && event !== 'error') {
          stream.removeListener(event, onceEvent)
        }
        stream.removeListener('end', onceEnd)
        stream.removeListener('finish', onceFinish)
        this.writable._errored = e
        reject(e)
      }

      if (event !== 'end' && event !== 'finish' && event !== 'error') {
        stream.once(event, onceEvent)
      }
      stream.once('end', onceEnd)
      stream.once('finish', onceFinish)
      stream.once('error', onceError)
    })
  }
}

PromiseDuplex.PromiseDuplex = PromiseDuplex
PromiseDuplex.default = PromiseDuplex

module.exports = PromiseDuplex
