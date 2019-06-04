import {Duplex} from "stream"

export class MockStreamDuplex extends Duplex {
  readable = true
  writable = true

  closed = false
  destroyed = false

  ended = false
  paused = false

  bytesWritten = 0

  readBuffer = Buffer.alloc(0)
  writeBuffer = Buffer.alloc(0)

  private encoding?: string
  private error?: Error

  close(): void {
    this.closed = true
  }
  destroy(): void {
    this.destroyed = true
  }
  pause(): this {
    this.paused = true
    return this
  }
  resume(): this {
    this.paused = false
    return this
  }
  read(size: number = 1024): any {
    size = size || 1024
    if (this.error) {
      this.emit("error", this.error)
      return null
    }
    if (this.readBuffer.length === 0) {
      if (!this.ended) {
        this.ended = true
        this.emit("end")
      }
      return null
    }
    const chunk = this.readBuffer.slice(0, size)
    this.readBuffer = this.readBuffer.slice(size)
    return this.encoding ? chunk.toString(this.encoding) : chunk
  }
  write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean
  write(chunk: any, encoding: string, cb?: (error: Error | null | undefined) => void): boolean
  write(chunk: any, _arg2?: any, _arg3?: any): boolean {
    if (this.closed) {
      return this.emit("error", new Error("writeAll after end"))
    } else {
      this.writeBuffer = Buffer.concat([this.writeBuffer, chunk])
      this.bytesWritten = this.writeBuffer.length
    }
    return !chunk.toString().startsWith("pause")
  }
  end(): void {
    // noop
  }
  cork(): void {
    // noop
  }
  uncork(): void {
    // noop
  }
  setEncoding(encoding: string): this {
    this.encoding = encoding
    return this
  }
  append(chunk: Buffer): void {
    this.readBuffer = Buffer.concat([this.readBuffer, chunk])
  }
  setError(e: Error): void {
    this.error = e
  }
}
