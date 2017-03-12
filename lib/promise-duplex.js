'use strict'

const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')

class PromiseDuplex {
  constructor (stream) {
    this.readable = new PromiseReadable(stream)
    this.writable = new PromiseWritable(stream)
    this.stream = stream
  }

  // PromiseReadable
  read (size) {
    return this.readable.read(size)
  }

  readAll () {
    return this.readable.readAll()
  }

  onceEnd () {
    return this.readable.onceEnd()
  }

  // PromiseWritable
  write (chunk, encoding) {
    return this.writable.write(chunk, encoding)
  }

  writeAll (content, chunkSize) {
    return this.writable.writeAll(content, chunkSize)
  }

  oncePipe () {
    return this.writable.oncePipe()
  }

  onceUnpipe () {
    return this.writable.onceUnpipe()
  }

  end () {
    return this.writable.end()
  }

  // PromiseDuplex
  onceOpen () {
    return this._onceEvent('open')
  }

  onceClose () {
    return this._onceEvent('close')
  }

  _onceEvent (event) {
    const stream = this.stream
    return new Promise((resolve, reject) => {
      if (this.readable._ended) {
        return resolve(null)
      }

      if (this.writable._finished) {
        return reject(new Error(`once ${event} after end`))
      }

      const onceEvent = argument => {
        stream.removeListener('end', onceEnd)
        stream.removeListener('finish', onceFinish)
        stream.removeListener('error', onceError)
        resolve(argument)
      }

      const onceEnd = () => {
        stream.removeListener(event, onceEvent)
        stream.removeListener('finish', onceFinish)
        stream.removeListener('error', onceError)
        this.readable._ended = true
        resolve(null)
      }

      const onceFinish = () => {
        stream.removeListener(event, onceEvent)
        stream.removeListener('end', onceEnd)
        stream.removeListener('error', onceError)
        this.writable._finished = true
        return reject(new Error(`once ${event} after end`))
      }

      const onceError = e => {
        stream.removeListener(event, onceEvent)
        stream.removeListener('end', onceEnd)
        stream.removeListener('finish', onceFinish)
        this.writable._errored = true
        reject(e)
      }

      stream.once(event, onceEvent)
      stream.once('end', onceEnd)
      stream.once('finish', onceFinish)
      stream.once('error', onceError)
    })
  }
}

module.exports = PromiseDuplex
