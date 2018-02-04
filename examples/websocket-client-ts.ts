#!/usr/bin/env ts-node

import PromiseDuplex from '../lib/promise-duplex'

// tslint:disable:no-var-requires
const SimpleWebsocket = require('simple-websocket')

async function main (): Promise<void> {
  const ws = new PromiseDuplex(new SimpleWebsocket({ url: 'ws://echo.websocket.org', encoding: 'utf8' }))
  const request = process.argv[2] || 'Hello, world!'
  await ws.write(request)
  const response = await ws.read()
  console.info(response)
  await ws.end()
  ws.destroy()
}

void main().catch(console.error)
