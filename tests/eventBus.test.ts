import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '../src/core/events/eventBus';

describe('eventBus', () => {
  it('emits and receives events', () => {
    const fn = vi.fn();
    const off = eventBus.on('theme:changed', fn);
    eventBus.emit('theme:changed', 'dark');
    expect(fn).toHaveBeenCalledWith('dark');
    off();
    eventBus.emit('theme:changed', 'light');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
