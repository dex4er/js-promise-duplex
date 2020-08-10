import {expect} from "chai"

import {PromiseDuplex} from "../src/promise-duplex"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {MockStreamDuplex} from "./lib/mock-stream-duplex"

Feature("Test promise-duplex module for async iterator", () => {
  Scenario("Read chunks from stream", () => {
    let iterator: AsyncIterableIterator<string | Buffer>
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let result: IteratorResult<string | Buffer>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When("stream contains some data", () => {
      stream.append(Buffer.from("chunk1"))
    })

    And("I call iterate method", () => {
      iterator = promiseDuplex[Symbol.asyncIterator]()
    })

    And("I get a result from iterator", async () => {
      result = await iterator.next()
    })

    Then("iterator is not done", () => {
      expect(result.done).to.be.false()
    })

    And("iterator returns chunk", () => {
      expect(result.value).to.deep.equal(Buffer.from("chunk1"))
    })

    And("PromiseDuplex object can be destroyed", () => {
      promiseDuplex.destroy()
    })

    And("PromiseDuplex object can be destroyed", () => {
      promiseDuplex.destroy()
    })
  })

  Scenario("Read chunks from stream with encoding", () => {
    let iterator: AsyncIterableIterator<string | Buffer>
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let result: IteratorResult<string | Buffer>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When("stream contains some data", () => {
      stream.append(Buffer.from("chunk1"))
    })

    And("I set encoding", () => {
      promiseDuplex.setEncoding("utf8")
    })

    And("I call iterate method", () => {
      iterator = promiseDuplex[Symbol.asyncIterator]()
    })

    And("I get a result from iterator", async () => {
      result = await iterator.next()
    })

    Then("iterator is not done", () => {
      expect(result.done).to.be.false()
    })

    And("iterator returns chunk", () => {
      expect(result.value).to.equal("chunk1")
    })

    And("stream can be destroyed", () => {
      promiseDuplex.destroy()
    })
  })
})
