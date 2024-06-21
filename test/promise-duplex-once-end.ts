import {expect} from "chai"

import {PromiseDuplex} from "../src/promise-duplex.js"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps.js"

import {MockStreamDuplex} from "./lib/mock-stream-duplex.js"

Feature('Test promise-duplex module for once("end") method', () => {
  Scenario("Wait for end from stream", () => {
    let ended = false
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When('I wait for "end" event', () => {
      promiseDuplex.once("end").then(() => {
        ended = true
      })
    })

    And("data event is emitted", () => {
      stream.emit("data", Buffer.from("chunk1"))
    })

    And("another data event is emitted", () => {
      stream.emit("data", Buffer.from("chunk2"))
    })

    And("close event is emitted", () => {
      stream.emit("end")
    })

    Then("promise is fulfilled", () => {
      expect(ended).to.be.true
    })
  })
})
