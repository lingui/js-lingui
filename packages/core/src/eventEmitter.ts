export class EventEmitter<
  Events extends { [name: string]: (...args: any[]) => any },
> {
  private readonly _events: {
    [name in keyof Events]?: Array<Events[name]>
  } = {}

  on(event: keyof Events, listener: Events[typeof event]): () => void {
    this._events[event] ??= []
    this._events[event]!.push(listener)

    return () => this.removeListener(event, listener)
  }

  removeListener(event: keyof Events, listener: Events[typeof event]): void {
    const maybeListeners = this._getListeners(event)
    if (!maybeListeners) return

    const index = maybeListeners.indexOf(listener)
    if (~index) maybeListeners.splice(index, 1)
  }

  emit(event: keyof Events, ...args: Parameters<Events[typeof event]>): void {
    const maybeListeners = this._getListeners(event)
    if (!maybeListeners) return

    maybeListeners.map((listener) => listener.apply(this, args))
  }

  private _getListeners(
    event: keyof Events,
  ): Array<Events[keyof Events]> | false {
    const maybeListeners = this._events[event]
    return Array.isArray(maybeListeners) ? maybeListeners : false
  }
}
