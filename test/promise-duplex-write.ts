import {expect} from "chai"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {MockStreamDuplex} from "./lib/mock-stream-duplex"

import {PromiseDuplex} from "../src/promise-duplex"

Feature("Test promise-duplex module for write method", () => {
  Scenario("Write chunks to stream which does not pause", () => {
    let bytes: number
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When("I call write method", async () => {
      bytes = await promiseDuplex.write(Buffer.from("chunk1"))
    })

    Then("promise resolves to number of bytes read", () => {
      expect(bytes).to.equal(6)
    })

    And("stream should contain this chunk", () => {
      expect(stream.writeBuffer).to.deep.equal(Buffer.from("chunk1"))
    })
  })
})
