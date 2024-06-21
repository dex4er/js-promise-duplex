#!/usr/bin/env -S node --experimental-specifier-resolution=node --no-warnings --loader ts-node/esm

import SimpleWebsocket from "simple-websocket"

import PromiseDuplex from "../src/promise-duplex.js"

import assert from "node:assert"

async function main(): Promise<void> {
  const ws = new PromiseDuplex(new SimpleWebsocket({url: "wss://echo.websocket.org"}))
  const request = process.argv[2] || "Hello, world!"
  await ws.write(request)
  const response1 = await ws.read()
  assert(response1 instanceof Buffer)
  console.info(response1.toString())
  const response2 = await ws.read()
  assert(response2 instanceof Buffer)
  console.info(response2.toString())
  await ws.end()
  ws.destroy()
}

void main().catch(console.error)
