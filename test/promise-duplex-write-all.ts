import {expect} from 'chai'

import {And, Feature, Given, Scenario, Then, When} from './lib/steps'

import {MockStreamDuplex} from './lib/mock-stream-duplex'

import {PromiseDuplex} from '../src/promise-duplex'

Feature('Test promise-duplex module for writeAll method', () => {
  Scenario('Write all chunks', () => {
    let bytes: number
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let stream: MockStreamDuplex

    Given('Duplex object', () => {
      stream = new MockStreamDuplex()
    })

    And('PromiseDuplex object', () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I call writeAll method', () => {
      promiseDuplex.writeAll(Buffer.from('chunk1chunk2chunk3')).then(argument => {
        bytes = argument
      })
    })

    And('finish event is emitted', () => {
      stream.emit('finish')
    })

    Then('promise resolves to number of bytes read', () => {
      expect(bytes).to.equal(18)
    })

    And('stream should contain this chunk', () => {
      expect(stream.writeBuffer).to.deep.equal(Buffer.from('chunk1chunk2chunk3'))
    })
  })
})
