## promise-duplex

[![Build Status](https://secure.travis-ci.org/dex4er/js-promise-duplex.svg)](http://travis-ci.org/dex4er/js-promise-duplex) [![Coverage Status](https://coveralls.io/repos/github/dex4er/js-promise-duplex/badge.svg)](https://coveralls.io/github/dex4er/js-promise-duplex) [![npm](https://img.shields.io/npm/v/promise-duplex.svg)](https://www.npmjs.com/package/promise-duplex)

This module allows to convert
[`Duplex`](https://nodejs.org/api/stream.html#stream_class_stream_duplex)
stream into its promisified version, which returns [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
object fulfilled when stream's events occurred.

The module combines
[`promise-readable`](https://www.npmjs.com/package/promise-readable) and
[`promise-writable`](https://www.npmjs.com/package/promise-writable) in one.

### Requirements

This module requires Node >= 4.

### Installation

```shell
npm install promise-duplex
```

### Usage

#### constructor

```js
const promiseDuplex = new PromiseDuplex(stream)
```

`PromiseDuplex` object requires `Duplex` object to work.

_Example:_

```js
const net = require('net')
const { PromiseDuplex } = require('promise-duplex')

const stream = new net.Socket()

const promiseDuplex = new PromiseDuplex(stream)
```

_Typescript:_

```js
import * as net from 'net'
import { PromiseDuplex } from 'promise-duplex'

const stream = new net.Socket()

const promiseDuplex = new PromiseDuplex(stream)
```

#### stream

```js
const stream = promiseDuplex.stream
```

Original stream object.

_Example:_

```js
console.log(promiseDuplex.stream.localAddress)
```

#### read

```js
const chunk = await promiseDuplex.read(chunkSize)
```

Check
[`PromiseReadable.read`](https://www.npmjs.com/package/promise-readable#read)
for details.

#### readAll

```js
const content = await promiseDuplex.readAll()
```

Check
[`PromiseReadable.readAll`](https://www.npmjs.com/package/promise-readable#readall)
for details.

#### write

```js
await promiseDuplex.write(chunk)
```

Check
[`PromiseWritable.write`](https://www.npmjs.com/package/promise-writable#write)
for details.

#### writeAll

```js
await promiseDuplex.writeAll(content, chunkSize)
```

Check
[`PromiseWritable.writeAll`](https://www.npmjs.com/package/promise-writable#writeall)
for details.

#### end

```js
await promiseDuplex.end()
```

Check
[`PromiseWritable.once`](https://www.npmjs.com/package/promise-writable#end)
for details.

#### once

```js
const result = await promiseDuplex.once(event)
```

Check
[`PromiseReadable.once`](https://www.npmjs.com/package/promise-readable#once)
and
[`PromiseWritable.once`](https://www.npmjs.com/package/promise-writable#once)
for details.

### License

Copyright (c) 2017-2018 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
