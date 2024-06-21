#!/usr/bin/env -S node --experimental-specifier-resolution=node --no-warnings --loader ts-node/esm

import SimpleWebsocket from "simple-websocket"

const ws = new SimpleWebsocket({url: "wss://echo.websocket.org"})
const request = process.argv[2] || Buffer.from("Hello, world!")
ws.on("data", (data: Buffer) => {
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
