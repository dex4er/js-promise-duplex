'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

Feature('Test promise-duplex module', () => {
  const PromiseDuplex = require('../lib/promise-duplex')
  const EventEmitter = require('events')

  class MockStream extends EventEmitter {
    constructor () {
      super()
      this.readable = true
      this.writable = true
      this._buffer = Buffer.alloc(0)
    }
    pause () {}
    resume () {}
    write (chunk) {
      this._buffer = Buffer.concat([this._buffer, chunk])
      return !chunk.toString().startsWith('pause')
    }
    end () {}
  }

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

    When('I call read method', () => {
      promise = promiseDuplex.read()
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    Then('promise returns chunk', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1'))
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
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
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

  Scenario('Write chunks to stream which doesn not pause', () => {
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
      stream._buffer.should.deep.equal(Buffer.from('chunk1'))
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
      stream._buffer.should.deep.equal(Buffer.from('chunk1chunk2chunk3'))
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

      When(`I call ${event} method`, () => {
        promise = promiseDuplex.once(event)
      })

      And(`${event} event is emitted`, () => {
        stream.emit(event, 'result')
      })

      Then('promise is fulfilled', () => {
        return promise.should.eventually.equal('result')
      })
    })

    Scenario(`Wait for ${event} from finished stream`, () => {
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

      And('finish event is emitted', () => {
        stream.emit('finish')
      })

      Then('promise returns undefined', () => {
        return promise.should.eventually.be.undefined
      })

      When(`I call ${event} method`, () => {
        promise = promiseDuplex.once(event)
      })

      Then('promise is rejected', () => {
        return promise.should.be.rejectedWith(Error, `once ${event} after end`)
      })
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
    })
  }

  for (const event of ['open', 'close']) {
    Scenario(`Wait for ${event} from ended stream`, () => {
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

      And('finish event is emitted', () => {
        stream.emit('end')
      })

      Then('promise returns undefined', () => {
        return promise.should.eventually.be.undefined
      })
    })
  }
})
