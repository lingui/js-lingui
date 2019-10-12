export class EventEmitter<
  Events extends { [name: string]: (...args: any[]) => any }
> {
  private readonly _events: {
    [name in keyof Events]?: Array<Events[name]>
  } = {}

  on(event: keyof Events, listener: Events[typeof event]): () => void {
    if (!this._hasEvent(event)) this._events[event] = []

    this._events[event].push(listener)
    return () => this.removeListener(event, listener)
  }

  removeListener(event: keyof Events, listener: Events[typeof event]): void {
    if (!this._hasEvent(event)) return

    const index = this._events[event].indexOf(listener)
    if (~index) this._events[event].splice(index, 1)
  }

  emit(event: keyof Events, ...args: Parameters<Events[typeof event]>): void {
    if (!this._hasEvent(event)) return

    this._events[event].map(listener => listener.apply(this, args))
  }

  private _hasEvent(event: keyof Events) {
    return Array.isArray(this._events[event])
  }
}
