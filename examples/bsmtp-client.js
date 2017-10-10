#!/usr/bin/env node

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

const { PromiseReadable } = require('promise-readable')
const { PromiseWritable } = require('promise-writable')
const { PromiseDuplex } = require('../lib/promise-duplex')

const net = require('net')
const byline = require('byline')

const host = process.argv[2] || 'localhost'
const port = Number(process.argv[3]) || 25

const psocket = new PromiseDuplex(new net.Socket())
const pstdin = new PromiseReadable(byline(process.stdin, {keepEmptyLines: true}))
const pstdout = new PromiseWritable(process.stdout)

psocket.stream.connect(port, host, client)

async function client () {
  try {
    // which line for DATA command?
    let dataLine = 0

    while (1) {
      // if it is not line for DATA command then read line from server
      if (dataLine < 2) {
        await pstdout.write('S: ')

        const rchunk = await psocket.read()
        // is it EOF?
        if (rchunk == null) break

        await pstdout.write(rchunk)

        // if this is another line in DATA command
        if (dataLine) dataLine++
      }

      await pstdout.write('C: ')

      const wchunk = await pstdin.read()
      // is it EOF?
      if (wchunk == null) break

      // echo if was not terminal
      if (!process.stdin.isTTY) {
        await pstdout.write(wchunk + '\n')
      }

      if (wchunk.toString().toUpperCase() === 'DATA') {
        dataLine = 1
      } else if (wchunk.toString() === '.') {
        dataLine = 0
      }

      // input has EOL removed so CRLF has to be added
      await psocket.write(Buffer.concat([wchunk, Buffer.from('\x0d\x0a')]))
    }

    psocket.end()
  } catch (e) {
    console.error(e)
  }
}
