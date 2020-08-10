#!/usr/bin/env ts-node

import SimpleWebsocket from "simple-websocket"

import PromiseDuplex from "../src/promise-duplex"

async function main(): Promise<void> {
  const ws = new PromiseDuplex(new SimpleWebsocket({url: "ws://echo.websocket.org"}))
  const request = process.argv[2] || "Hello, world!"
  await ws.write(request)
  const response = (await ws.read()) as Buffer
  console.info(response.toString())
  await ws.end()
  ws.destroy()
}

void main().catch(console.error)
