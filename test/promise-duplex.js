'use strict'

/* global Feature, Scenario, Given, When, Then */
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
      this._buffer = new Buffer(0)
    }
    pause () {}
    resume () {}
    write (chunk) {
      this._buffer = Buffer.concat([this._buffer, chunk])
      return !chunk.toString().startsWith('pause')
    }
    end () { }
  }

  Scenario('Read chunks from stream', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call read method', () => {
      this.promise = this.promiseDuplex.read()
    })

    When('data event is emitted', () => {
      this.stream.emit('data', new Buffer('chunk1'))
    })

    Then('promise returns chunk', () => {
      return this.promise.should.eventually.deep.equal(new Buffer('chunk1'))
    })
  })

  Scenario('Read all from stream', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call readAll method', () => {
      this.promise = this.promiseDuplex.readAll()
    })

    When('data event is emitted', () => {
      this.stream.emit('data', new Buffer('chunk1'))
    })

    When('another data event is emitted', () => {
      this.stream.emit('data', new Buffer('chunk2'))
    })

    When('close event is emitted', () => {
      this.stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return this.promise.should.eventually.deep.equal(new Buffer('chunk1chunk2'))
    })
  })

  Scenario('Wait for end from stream', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call end method', () => {
      this.promise = this.promiseDuplex.once('end')
    })

    When('data event is emitted', () => {
      this.stream.emit('data', new Buffer('chunk1'))
    })

    When('another data event is emitted', () => {
      this.stream.emit('data', new Buffer('chunk2'))
    })

    When('close event is emitted', () => {
      this.stream.emit('end')
    })

    Then('promise returns null', () => {
      return this.promise.should.eventually.be.null
    })
  })

  Scenario('Write chunks to stream which doesn not pause', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call write method', () => {
      this.promise = this.promiseDuplex.write(new Buffer('chunk1'))
    })

    Then('promise is fulfilled', () => {
      return this.promise.should.be.fulfilled.and.ok
    })

    Then('stream should contain this chunk', () => {
      this.stream._buffer.should.deep.equal(new Buffer('chunk1'))
    })
  })

  Scenario('Write all in one chunk', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call writeAll method', () => {
      this.promise = this.promiseDuplex.writeAll(new Buffer('chunk1chunk2chunk3'))
    })

    When('finish event is emitted', () => {
      this.stream.emit('finish')
    })

    Then('promise is fulfilled', () => {
      return this.promise.should.be.fulfilled.and.ok
    })

    Then('stream should contain this chunk', () => {
      this.stream._buffer.should.deep.equal(new Buffer('chunk1chunk2chunk3'))
    })
  })

  Scenario('End the stream', function () {
    Given('Duplex object', () => {
      this.stream = new MockStream()
    })

    Given('PromiseDuplex object', () => {
      this.promiseDuplex = new PromiseDuplex(this.stream)
    })

    When('I call end method', () => {
      this.promise = this.promiseDuplex.end()
    })

    When('finish event is emitted', () => {
      this.stream.emit('finish')
    })

    Then('promise is fulfilled', () => {
      return this.promise.should.be.fulfilled.and.ok
    })
  })

  for (const event of ['open', 'close', 'pipe', 'unpipe']) {
    Scenario(`Wait for ${event} from stream`, function () {
      Given('Duplex object', () => {
        this.stream = new MockStream()
      })

      Given('PromiseDuplex object', () => {
        this.promiseDuplex = new PromiseDuplex(this.stream)
      })

      When(`I call ${event} method`, () => {
        this.promise = this.promiseDuplex.once(event)
      })

      When(`${event} event is emitted`, () => {
        this.stream.emit(event, 'result')
      })

      Then('promise is fulfilled', () => {
        return this.promise.should.eventually.equal('result')
      })
    })

    Scenario(`Wait for ${event} from finished stream`, function () {
      Given('Duplex object', () => {
        this.stream = new MockStream()
      })

      Given('PromiseDuplex object', () => {
        this.promiseDuplex = new PromiseDuplex(this.stream)
      })

      When(`I call ${event} method`, () => {
        this.promise = this.promiseDuplex.once(event)
      })

      When('finish event is emitted', () => {
        this.stream.emit('finish')
      })

      Then('promise returns null', () => {
        return this.promise.should.eventually.be.null
      })

      When(`I call ${event} method`, () => {
        this.promise = this.promiseDuplex.once(event)
      })

      Then('promise is rejected', () => {
        return this.promise.should.be.rejectedWith(Error, `once ${event} after end`)
      })
    })

    Scenario(`Wait for ${event} from stream with error`, function () {
      Given('Duplex object', () => {
        this.stream = new MockStream()
      })

      Given('PromiseDuplex object', () => {
        this.promiseDuplex = new PromiseDuplex(this.stream)
      })

      When(`I call ${event} method`, () => {
        this.promise = this.promiseDuplex.once(event)
      })

      When('error event is emitted', () => {
        this.stream.emit('error', new Error('boom'))
      })

      Then('promise is rejected', () => {
        return this.promise.should.be.rejectedWith(Error, 'boom')
      })
    })
  }

  for (const event of ['open', 'close']) {
    Scenario(`Wait for ${event} from ended stream`, function () {
      Given('Duplex object', () => {
        this.stream = new MockStream()
      })

      Given('PromiseDuplex object', () => {
        this.promiseDuplex = new PromiseDuplex(this.stream)
      })

      When(`I call ${event} method`, () => {
        this.promise = this.promiseDuplex.once(event)
      })

      When('finish event is emitted', () => {
        this.stream.emit('end')
      })

      Then('promise is rejected', () => {
        return this.promise.should.eventually.be.null
      })
    })
  }
})
