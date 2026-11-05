import { describe, it, expect } from 'vitest';
import { WIDGET_DEFINITIONS, WIDGET_TYPE_IDS } from '../src/core/widgets/definitions';

describe('Widget definitions', () => {
  it('has 8 widget types', () => {
    expect(WIDGET_TYPE_IDS).toHaveLength(8);
  });
  it('each has refreshMs >= 0', () => {
    for (const id of WIDGET_TYPE_IDS) {
      expect(WIDGET_DEFINITIONS[id].refreshMs).toBeGreaterThanOrEqual(0);
      expect(WIDGET_DEFINITIONS[id].defaultWidth).toBeGreaterThan(0);
    }
  });
});
