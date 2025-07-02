export class EventEmitter<
  Events extends { [name: string]: (...args: any[]) => void }
> {
  private readonly events: {
    [name in keyof Events]?: Set<Events[name]>
  } = {}

  on(event: keyof Events, listener: Events[typeof event]): () => void {
    this.events[event] ??= new Set()
    this.events[event].add(listener)

    return () => {
      const listeners = this.events[event]
      listeners?.delete(listener)

      if (listeners?.size === 0) {
        delete this.events[event]
      }
    }
  }

  emit(event: keyof Events, ...args: Parameters<Events[typeof event]>): void {
    const listeners = this.events[event]
    if (!listeners) return

    for (const listener of [...listeners]) {
      listener.apply(this, args)
    }
  }
}
