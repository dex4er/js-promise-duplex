#!/usr/bin/env node

const SimpleWebsocket = require('simple-websocket')

const ws = new SimpleWebsocket({url: 'ws://echo.websocket.org'})
const request = process.argv[2] || 'Hello, world!'
ws.on('data', data => {
  console.info(data.toString())
  ws.end()
})
ws.on('end', () => {
  ws.destroy()
})
ws.write(request, err => {
  if (err) throw err
})
