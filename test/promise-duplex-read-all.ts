import {expect} from "chai"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {MockStreamDuplex} from "./lib/mock-stream-duplex"

import {PromiseDuplex} from "../src/promise-duplex"

Feature("Test promise-duplex module for readAll method", () => {
  Scenario("Read all from stream", () => {
    let content: string | Buffer | undefined
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When("I call readAll method", () => {
      promiseDuplex.readAll().then(argument => {
        content = argument
      })
    })

    And("data event is emitted", () => {
      if (!stream.paused) {
        stream.emit("data", Buffer.from("chunk1"))
      }
    })

    And("another data event is emitted", () => {
      if (!stream.paused) {
        stream.emit("data", Buffer.from("chunk2"))
      }
    })

    And("close event is emitted", () => {
      stream.emit("end")
    })

    Then("promise resolves to all chunks in one buffer", () => {
      expect(content).to.deep.equal(Buffer.from("chunk1chunk2"))
    })
  })
})
