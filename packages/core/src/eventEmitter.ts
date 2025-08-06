export class EventEmitter<
  Events extends { [name: string]: (...args: any[]) => void }
> {
  private readonly _events: {
    [name in keyof Events]?: Set<Events[name]>
  } = {}

  on(event: keyof Events, listener: Events[typeof event]): () => void {
    this._events[event] ??= new Set()
    this._events[event].add(listener)

    return () => this.removeListener(event, listener)
  }

  removeListener(event: keyof Events, listener: Events[typeof event]): void {
    const listeners = this._events[event]
    listeners?.delete(listener)

    if (listeners?.size === 0) {
      delete this._events[event]
    }
  }

  emit(event: keyof Events, ...args: Parameters<Events[typeof event]>): void {
    const listeners = this._events[event]
    if (!listeners) return

    for (const listener of [...listeners]) {
      listener.apply(this, args)
    }
  }
}
