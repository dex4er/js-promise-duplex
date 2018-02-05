'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const EventEmitter = require('events').EventEmitter

const PromiseDuplex = require('../lib/promise-duplex')

class MockStream extends EventEmitter {
  constructor () {
    super()
    this.readable = true
    this.paused = false
    this.writable = true
    this._readBuffer = Buffer.alloc(0)
    this._writeBuffer = Buffer.alloc(0)
    this._ended = false
  }
  close () {
    this.closed = true
  }
  destroy () {
    this.destoyed = true
  }
  pause () {
    this.paused = true
  }
  resume () {
    this.paused = false
  }
  read (size) {
    size = size || 1024
    if (this._error) {
      this.emit('error', this._error)
      return null
    }
    if (this._readBuffer.length === 0) {
      if (!this._ended) {
        this._ended = true
        this.emit('end')
      }
      return null
    }
    const chunk = this._readBuffer.slice(0, size)
    this._readBuffer = this._readBuffer.slice(size)
    return this.encoding ? chunk.toString(this.encoding) : chunk
  }
  write (chunk) {
    this._writeBuffer = Buffer.concat([this._writeBuffer, chunk])
    return !chunk.toString().startsWith('pause')
  }
  end () {}
  cork () {}
  uncork () {}
  setEncoding (encoding) {
    this.encoding = encoding
  }
  _append (chunk) {
    this._readBuffer = Buffer.concat([this._readBuffer, chunk])
  }
  _setError (e) {
    this._error = e
  }
}

Feature('Test promise-duplex module', () => {
  Scenario('Read chunks from stream', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('stream contains some data', () => {
      stream._append(Buffer.from('chunk1'))
    })

    And('I call read method', () => {
      promise = promiseDuplex.read()
    })

    Then('promise returns chunk', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1'))
    })

    And('PromiseDuplex object can be destroyed', () => {
      promiseDuplex.destroy()
    })

    And('PromiseDuplex object can be destroyed', () => {
      promiseDuplex.destroy()
    })
  })

  Scenario('Read chunks from stream with encoding', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('stream contains some data', () => {
      stream._append(Buffer.from('chunk1'))
    })

    And('I set encoding', () => {
      promise = promiseDuplex.setEncoding('utf8')
    })

    And('I call read method', () => {
      promise = promiseDuplex.read()
    })

    Then('promise returns chunk as string', () => {
      return promise.should.eventually.deep.equal('chunk1')
    })

    And('stream can be destroyed', () => {
      promiseDuplex.destroy()
    })
  })

  Scenario('Read all from stream', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call readAll method', () => {
      promise = promiseDuplex.readAll()
    })

    And('data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk1'))
      }
    })

    And('another data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk2'))
      }
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1chunk2'))
    })
  })

  Scenario('Wait for end from stream', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call end method', () => {
      promise = promiseDuplex.once('end')
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns undefined', () => {
      return promise.should.eventually.be.undefined
    })
  })

  Scenario('Write chunks to stream which does not pause', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call write method', () => {
      promise = promiseDuplex.write(Buffer.from('chunk1'))
    })

    Then('promise is fulfilled', () => {
      return promise.should.be.fulfilled.and.ok
    })

    And('stream should contain this chunk', () => {
      stream._writeBuffer.should.deep.equal(Buffer.from('chunk1'))
    })
  })

  Scenario('Write all in one chunk', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call writeAll method', () => {
      promise = promiseDuplex.writeAll(Buffer.from('chunk1chunk2chunk3'))
    })

    And('finish event is emitted', () => {
      stream.emit('finish')
    })

    Then('promise is fulfilled', () => {
      return promise.should.be.fulfilled.and.ok
    })

    And('stream should contain this chunk', () => {
      stream._writeBuffer.should.deep.equal(Buffer.from('chunk1chunk2chunk3'))
    })
  })

  Scenario('End the stream', () => {
    let promise
    let promiseDuplex
    let stream

    Given('Duplex object', () => {
      stream = new MockStream()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call end method', () => {
      promise = promiseDuplex.end()
    })

    And('finish event is emitted', () => {
      stream.emit('finish')
    })

    Then('promise is fulfilled', () => {
      return promise.should.be.fulfilled.and.ok
    })
  })

  for (const event of ['open', 'close', 'pipe', 'unpipe']) {
    Scenario(`Wait for ${event} from stream`, () => {
      let promise
      let promiseDuplex
      let stream

      Given('Duplex object', () => {
        stream = new MockStream()
      })

      And('PromiseDuplex object', () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When(`I call once('${event}') method`, () => {
        promise = promiseDuplex.once(event)
      })

      And(`${event} event is emitted`, () => {
        stream.emit(event)
      })

      if (event !== 'finish') {
        Then('promise is fulfilled', () => {
          return promise.should.be.fulfilled
        })
      } else {
        Then('promise returns undefined', () => {
          return promise.should.eventually.be.undefined
        })
      }
    })

    Scenario(`Wait for ${event} from closed stream`, () => {
      let promise
      let promiseDuplex
      let stream

      Given('Duplex object', () => {
        stream = new MockStream()
      })

      And('PromiseDuplex object', () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When('stream is closed', () => {
        stream.close()
      })

      And(`I call once('${event}') method`, () => {
        promise = promiseDuplex.once(event)
      })

      if (event === 'close') {
        Then('promise returns undefined', () => {
          return promise.should.eventually.be.undefined
        })
      } else {
        Then('promise is rejected', () => {
          return promise.should.be.rejectedWith(Error, `once ${event} after close`)
        })
      }
    })

    Scenario(`Wait for ${event} from stream with error`, () => {
      let promise
      let promiseDuplex
      let stream

      Given('Duplex object', () => {
        stream = new MockStream()
      })

      And('PromiseDuplex object', () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When(`I call ${event} method`, () => {
        promise = promiseDuplex.once(event)
      })

      And('error event is emitted', () => {
        stream.emit('error', new Error('boom'))
      })

      Then('promise is rejected', () => {
        return promise.should.be.rejectedWith(Error, 'boom')
      })

      And('PromiseDuplex object can be destroyed', () => {
        promiseDuplex.destroy()
      })

      And('PromiseDuplex object can be destroyed', () => {
        promiseDuplex.destroy()
      })
    })

    Scenario(`Wait for ${event} from stream with error emitted before method`, () => {
      let promise
      let promiseDuplex
      let stream

      Given('Duplex object', () => {
        stream = new MockStream()
      })

      And('PromiseDuplex object', () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      And('error event is emitted', () => {
        stream.emit('error', new Error('boom'))
      })

      When(`I call ${event} method`, () => {
        promise = promiseDuplex.once(event)
      })

      Then('promise is rejected', () => {
        return promise.should.be.rejectedWith(Error, 'boom')
      })
    })
  }
})
