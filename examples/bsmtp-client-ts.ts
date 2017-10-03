#!/usr/bin/env ts-node

/*

This is an implementation of BSMTP (Batch Simple Mail Transfer Protocol) client
with console or a file as an input.

Example session:

$ node examples/bsmtp-client.js localhost 25 < examples/bsmtp.txt
S: 220 MDEPR186025-573 ESMTP
C: HELO client
S: 250 MDEPR186025-573 Nice to meet you, [127.0.0.1]
C: MAIL FROM:<test@example.com>
S: 250 Accepted
C: RCPT TO:<test@example.net>
S: 250 Accepted
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: test@example.com
C: To: test@example.net
C: Subject: test
C:
C: test
C: .
S: 250 OK: message queued
C: QUIT
S: 221 Bye
C:
S: ^D

*/

import { PromiseReadable } from 'promise-readable'
import { PromiseWritable } from 'promise-writable'
import { PromiseDuplex } from '../lib/promise-duplex'

import * as net from 'net'

import byline = require('byline')

const [host = 'localhost', port = '25'] = process.argv.slice(2, 4)

const socket = new PromiseDuplex(new net.Socket())
const stdin = new PromiseReadable(byline(process.stdin, { keepEmptyLines: true }))
const stdout = new PromiseWritable(process.stdout)

socket.stream.connect(Number(port), host, client)

async function client (arg: any): Promise<void> {
  try {
    // which line for DATA command?
    let dataLine = 0

    while (1) {
      // if it is not line for DATA command then read line from server
      if (dataLine < 2) {
        await stdout.write('S: ')

        const rchunk = await socket.read()
        // is it EOF?
        if (!rchunk) break

        await stdout.write(rchunk)

        // if this is another line in DATA command
        if (dataLine) dataLine++
      }

      await stdout.write('C: ')

      const wchunk = await stdin.read()
      // is it EOF?
      if (!wchunk) break

      // echo if was not terminal
      if (!process.stdin.isTTY) {
        await stdout.write(wchunk + '\n')
      }

      if (wchunk.toString().toUpperCase() === 'DATA') {
        dataLine = 1
      } else if (wchunk.toString() === '.') {
        dataLine = 0
      }

      // input has EOL removed so CRLF has to be added
      await socket.write(Buffer.concat([wchunk, Buffer.from('\x0d\x0a')]))
    }

    await socket.end()
  } catch (e) {
    console.error(e)
  }
}
