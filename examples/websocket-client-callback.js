#!/usr/bin/env node

import SimpleWebsocket from "simple-websocket"

const ws = new SimpleWebsocket({url: "wss://echo.websocket.org"})
const request = process.argv[2] || "Hello, world!"
ws.on("data", data => {
  console.info(data.toString())
  ws.end()
})
ws.on("end", () => {
  ws.destroy()
})
ws.on("error", e => {
  ws.destroy()
  console.error(e)
})
ws.write(request, err => {
  if (err) throw err
})
