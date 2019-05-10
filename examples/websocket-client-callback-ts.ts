#!/usr/bin/env ts-node

import SimpleWebsocket from 'simple-websocket'

const ws = new SimpleWebsocket({url: 'ws://echo.websocket.org'})
const request = process.argv[2] || Buffer.from('Hello, world!')
ws.on('data', (data: Buffer) => {
  console.info(data.toString())
  ws.end()
})
ws.on('end', () => {
  ws.destroy()
})
ws.write(request, err => {
  if (err) throw err
})
