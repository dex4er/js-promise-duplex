/// <reference types="node" />

import PromiseReadable from 'promise-readable'
import PromiseWritable from 'promise-writable'
import { Readable, Duplex } from 'stream'

export declare class PromiseDuplex<TDuplex extends Duplex> extends PromiseReadable<TDuplex> implements PromiseWritable<TDuplex> {
  readonly stream: TDuplex
  readonly readable: PromiseReadable<TDuplex>
  readonly writable: PromiseWritable<TDuplex>

  constructor (stream: TDuplex)

  read (size?: number): Promise<Buffer | undefined>
  readAll (): Promise<Buffer | undefined>

  setEncoding (encoding: string): this

  write (chunk: string | Buffer, encoding?: string): Promise<number>
  writeAll (content: string | Buffer, chunkSize?: number): Promise<number>

  once (event: 'close' | 'end' | 'error' | 'finish'): Promise<void>
  once (event: 'open'): Promise<number>
  once (event: 'pipe' | 'unpipe'): Promise<Readable>

  end (): Promise<void>

  destroy (): void
}

export default PromiseDuplex
