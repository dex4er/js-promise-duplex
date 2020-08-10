import chai, {expect} from "chai"

import dirtyChai from "dirty-chai"
chai.use(dirtyChai)

import {PromiseDuplex} from "../src/promise-duplex"

import {And, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {MockStreamDuplex} from "./lib/mock-stream-duplex"

Feature("Test promise-duplex module for once method", () => {
  for (const event of ["open", "close", "pipe", "unpipe"]) {
    Scenario(`Wait for "${event}" event from stream`, () => {
      let fulfilled = false
      let promiseDuplex: PromiseDuplex<MockStreamDuplex>
      let stream: MockStreamDuplex

      Given("Duplex object", () => {
        stream = new MockStreamDuplex()
      })

      And("PromiseDuplex object", () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When(`I wait for "${event}" event`, () => {
        promiseDuplex.once(event as any).then(() => {
          fulfilled = true
        })
      })

      And(`${event} event is emitted`, () => {
        stream.emit(event)
      })

      Then("promise is fulfilled", () => {
        expect(fulfilled).to.be.true()
      })
    })

    Scenario(`Wait for ${event} from closed stream`, () => {
      let error: Error
      let fulfilled = false
      let promiseDuplex: PromiseDuplex<MockStreamDuplex>
      let stream: MockStreamDuplex

      Given("Duplex object", () => {
        stream = new MockStreamDuplex()
      })

      And("PromiseDuplex object", () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When("stream is closed", () => {
        stream.close()
      })

      When(`I wait for "${event}" event`, () => {
        promiseDuplex
          .once(event as any)
          .then(() => {
            fulfilled = true
          })
          .catch(err => {
            error = err
          })
      })

      if (event === "close") {
        Then("promise is fulfilled", () => {
          expect(fulfilled).to.be.true()
        })
      } else {
        Then("promise is rejected", () => {
          expect(error).to.be.an("error").with.property("message", `once ${event} after close`)
        })
      }
    })

    Scenario(`Wait for ${event} from stream with error`, () => {
      let error: Error
      let promiseDuplex: PromiseDuplex<MockStreamDuplex>
      let stream: MockStreamDuplex

      Given("Duplex object", () => {
        stream = new MockStreamDuplex()
      })

      And("PromiseDuplex object", () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      When(`I wait for "${event}" event`, () => {
        promiseDuplex.once(event as any).catch(err => {
          error = err
        })
      })

      And("error event is emitted", () => {
        stream.emit("error", new Error("boom"))
      })

      Then("promise is rejected", () => {
        expect(error).to.be.an("error").with.property("message", "boom")
      })

      And("PromiseDuplex object can be destroyed", () => {
        promiseDuplex.destroy()
      })

      And("PromiseDuplex object can be destroyed", () => {
        promiseDuplex.destroy()
      })
    })

    Scenario(`Wait for ${event} from stream with error emitted before method`, () => {
      let error: Error
      let promiseDuplex: PromiseDuplex<MockStreamDuplex>
      let stream: MockStreamDuplex

      Given("Duplex object", () => {
        stream = new MockStreamDuplex()
      })

      And("PromiseDuplex object", () => {
        promiseDuplex = new PromiseDuplex(stream)
      })

      And("error event is emitted", () => {
        stream.emit("error", new Error("boom"))
      })

      When(`I wait for "${event}" event`, () => {
        promiseDuplex.once(event as any).catch(err => {
          error = err
        })
      })

      Then("promise is rejected", () => {
        expect(error).to.be.an("error").with.property("message", "boom")
      })
    })
  }
})
