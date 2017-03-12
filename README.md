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

`PromiseDuplex` object requires `Duplex` object to work:

```js
const PromiseDuplex = require('promise-duplex')

const dstream = new net.Socket()

const promiseDstream = new PromiseDuplex(dstream)
```

Original stream is available with `stream` property:

```js
console.log(promiseDstream.stream.localAddress)
```

#### read

Check
[`PromiseReadable.read`](https://www.npmjs.com/package/promise-readable#read)
for details.

#### readAll

Check
[`PromiseReadable.readAll`](https://www.npmjs.com/package/promise-readable#readall)
for details.

#### write

Check
[`PromiseWritable.write`](https://www.npmjs.com/package/promise-writable#write)
for details.

#### writeAll

Check
[`PromiseWritable.writeAll`](https://www.npmjs.com/package/promise-writable#writeall)
for details.

#### end

Check
[`PromiseWritable.end`](https://www.npmjs.com/package/promise-writable#end)
for details.

#### onceOpen

Check
[`PromiseReadable.onceOpen`](https://www.npmjs.com/package/promise-readable#onceopen)
and
[`PromiseWritable.onceOpen`](https://www.npmjs.com/package/promise-writable#onceopen)
for details.

#### onceClose

Check
[`PromiseReadable.onceClose`](https://www.npmjs.com/package/promise-readable#onceclose)
and
[`PromiseWritable.onceClose`](https://www.npmjs.com/package/promise-writable#onceclose)
for details.

#### oncePipe

Check
[`PromiseWritable.onceEnd`](https://www.npmjs.com/package/promise-writable#oncepipe)
for details.

#### onceUnpipe

Check
[`PromiseWritable.onceUnpipe`](https://www.npmjs.com/package/promise-writable#onceunpipe)
for details.

#### onceEnd

Check
[`PromiseReadable.onceEnd`](https://www.npmjs.com/package/promise-readable#onceend)
for details.

### Promise

This module uses [any-promise](https://www.npmjs.com/package/any-promise) and
any ES6 Promise library or polyfill is supported.

Ie. [bluebird](https://www.npmjs.com/package/bluebird) can be used as Promise
library for this module, if it is registered before.

```js
require('any-promise/register/bluebird')
const PromiseReadable = require('promise-duplex')
```

### License

Copyright (c) 2017 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
