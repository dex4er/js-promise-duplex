/// <reference types="node" />

import {PromiseReadable} from 'promise-readable'
import {PromiseWritable} from 'promise-writable'
import {Duplex} from 'stream'

interface DuplexStream extends Duplex {
  closed?: boolean
  destroyed?: boolean
}

export class PromiseDuplex<TDuplex extends DuplexStream> extends PromiseReadable<TDuplex> {
  readonly readable: PromiseReadable<TDuplex>
  readonly writable: PromiseWritable<TDuplex>

  readonly isPromiseReadable: boolean = true
  readonly isPromiseWritable: boolean = true

  constructor(readonly stream: TDuplex) {
    super(stream)
    this.readable = new PromiseReadable(stream)
    this.writable = new PromiseWritable(stream)
  }

  // PromiseReadable
  read(size?: number): Promise<string | Buffer | undefined> {
    return this.readable.read(size)
  }

  readAll(): Promise<string | Buffer | undefined> {
    return this.readable.readAll()
  }

  setEncoding(encoding: string): this {
    this.readable.setEncoding(encoding)
    return this
  }

  // PromiseWritable
  write(chunk: string | Buffer, encoding?: string): Promise<number> {
    return this.writable.write(chunk, encoding)
  }

  writeAll(content: string | Buffer, chunkSize?: number): Promise<number> {
    return this.writable.writeAll(content, chunkSize)
  }

  end(): Promise<void> {
    return this.writable.end()
  }

  // PromiseDuplex
  once(event: 'close' | 'end' | 'error' | 'finish'): Promise<void>
  once(event: 'open'): Promise<number>
  once(event: 'pipe' | 'unpipe'): Promise<NodeJS.ReadableStream>

  once(event: string): Promise<void | number | NodeJS.ReadableStream> {
    const stream = this.stream

    return new Promise((resolve, reject) => {
      if (this.readable._errored) {
        const err = this.readable._errored
        delete this.readable._errored
        return reject(err)
      }

      if (this.writable._errored) {
        const err = this.writable._errored
        delete this.writable._errored
        return reject(err)
      }

      if (stream.closed) {
        if (event === 'close') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after close`))
        }
      }

      if (stream.destroyed) {
        if (event === 'close' || event === 'end' || event === 'finish') {
          return resolve()
        } else {
          return reject(new Error(`once ${event} after destroy`))
        }
      }

      const eventHandler =
        event !== 'end' && event !== 'finish' && event !== 'error'
          ? (argument: any) => {
              removeListeners()
              resolve(argument)
            }
          : undefined

      const closeHandler = () => {
        removeListeners()
        resolve()
      }

      const endHandler =
        event !== 'close'
          ? () => {
              removeListeners()
              resolve()
            }
          : undefined

      const errorHandler = (err: Error) => {
        delete this.readable._errored
        delete this.writable._errored
        removeListeners()
        reject(err)
      }

      const finishHandler =
        event !== 'close'
          ? () => {
              removeListeners()
              resolve()
            }
          : undefined

      const removeListeners = () => {
        if (eventHandler) {
          stream.removeListener(event, eventHandler)
        }
        stream.removeListener('close', closeHandler)
        if (endHandler) {
          stream.removeListener('end', endHandler)
        }
        stream.removeListener('error', errorHandler)
        if (finishHandler) {
          stream.removeListener('finish', finishHandler)
        }
      }

      if (eventHandler) {
        stream.on(event, eventHandler)
      }
      stream.on('close', closeHandler)
      if (endHandler) {
        stream.on('end', endHandler)
      }
      if (finishHandler) {
        stream.on('finish', finishHandler)
      }
      stream.on('error', errorHandler)
    })
  }

  destroy(): void {
    if (this.readable) {
      this.readable.destroy()
    }
    if (this.writable) {
      this.writable.destroy()
    }
  }
}

export default PromiseDuplex
