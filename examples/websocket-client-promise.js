#!/usr/bin/env node

const {PromiseDuplex} = require('../lib/promise-duplex')

const SimpleWebsocket = require('simple-websocket')

async function main() {
  const ws = new PromiseDuplex(new SimpleWebsocket({url: 'ws://echo.websocket.org'}))
  const request = process.argv[2] || 'Hello, world!'
  await ws.write(request)
  const response = await ws.read()
  console.info(response.toString())
  await ws.end()
  ws.destroy()
}

void main().catch(console.error)