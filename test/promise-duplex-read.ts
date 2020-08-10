import {expect} from "chai"

import {PromiseDuplex} from "../src/promise-duplex"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {MockStreamDuplex} from "./lib/mock-stream-duplex"

Feature("Test promise-duplex module for read method", () => {
  Scenario("Read chunks from stream", () => {
    let chunk: string | Buffer | undefined
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
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

    And("I call read method", async () => {
      chunk = await promiseDuplex.read()
    })

    Then("promise resolves to chunk", () => {
      expect(chunk).to.deep.equal(Buffer.from("chunk1"))
    })

    And("PromiseDuplex object can be destroyed", () => {
      promiseDuplex.destroy()
    })

    And("PromiseDuplex object can be destroyed", () => {
      promiseDuplex.destroy()
    })
  })

  Scenario("Read chunks from stream with encoding", () => {
    let chunk: string | Buffer | undefined
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
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

    And("I call read method", async () => {
      chunk = await promiseDuplex.read()
    })

    Then("promise resolves to chunk as string", () => {
      expect(chunk).to.deep.equal("chunk1")
    })

    And("stream can be destroyed", () => {
      promiseDuplex.destroy()
    })
  })
})
