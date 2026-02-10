import { describe, expect, it } from 'bun:test';
import { hasEmotes, renderEmotes } from '@/lib/emotes';

describe('emotes helpers', () => {
  it('renders known emotes as emoji', () => {
    const rendered = renderEmotes('KEKW that clutch was PogChamp');

    expect(rendered).toContain('😂');
    expect(rendered).toContain('😮');
  });

  it('uses word boundaries and does not replace substrings', () => {
    const rendered = renderEmotes('NotPog should not be converted');

    expect(rendered).toContain('NotPog');
    expect(rendered).not.toContain('😮');
  });

  it('detects emotes case-insensitively', () => {
    expect(hasEmotes('this is kekw')).toBe(true);
    expect(hasEmotes('plain message')).toBe(false);
  });
});
