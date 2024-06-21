import {expect} from "chai"

import {PromiseDuplex} from "../src/promise-duplex.js"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps.js"

import {MockStreamDuplex} from "./lib/mock-stream-duplex.js"

Feature("Test promise-duplex module for end method", () => {
  Scenario("End the stream", () => {
    let ended = false
    let promiseDuplex: PromiseDuplex<MockStreamDuplex>
    let stream: MockStreamDuplex

    Given("Duplex object", () => {
      stream = new MockStreamDuplex()
    })

    And("PromiseDuplex object", () => {
      promiseDuplex = new PromiseDuplex(stream)
    })

    When("I call end method", () => {
      promiseDuplex.end().then(() => {
        ended = true
      })
    })

    And("finish event is emitted", () => {
      stream.emit("finish")
    })

    Then("promise is fulfilled", () => {
      expect(ended).be.true
    })
  })
})
