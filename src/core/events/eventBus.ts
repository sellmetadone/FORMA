import type { FormaEvent } from '@/types';

type Listener = (payload?: unknown) => void;

class EventBus {
  private listeners = new Map<FormaEvent | string, Set<Listener>>();

  on(event: FormaEvent | string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: FormaEvent | string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: FormaEvent | string, payload?: unknown) {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${event}:`, err);
      }
    });
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
