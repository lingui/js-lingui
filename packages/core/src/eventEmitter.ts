export class EventEmitter<
  Events extends { [name: string]: (...args: any[]) => void },
> {
  private readonly _events: {
    [name in keyof Events]?: Set<Events[name]>
  } = {}

  on<E extends keyof Events>(event: E, listener: Events[E]): () => void {
    this._events[event] ??= new Set()
    this._events[event].add(listener)

    return () => this.removeListener(event, listener)
  }

  removeListener<E extends keyof Events>(event: E, listener: Events[E]): void {
    const listeners = this._events[event]
    listeners?.delete(listener)

    if (listeners?.size === 0) {
      delete this._events[event]
    }
  }

  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): void {
    const listeners = this._events[event]
    if (!listeners) return

    for (const listener of [...listeners]) {
      listener.apply(this, args)
    }
  }
}
