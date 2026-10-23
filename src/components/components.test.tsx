import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActionButton, BottomNav } from './ui';
import { DifficultySelector } from './home';
import { LetterGrid, LetterTile, FoundWordsTray, WordEntry } from './gameplay';
import { Gameplay } from '../screens/Gameplay';
import { Countdown } from '../screens/Countdown';
import type { Difficulty } from '../types';

const noop = () => {};
describe('controlled presentation contracts', () => {
  it('renders caller-supplied values without computing game results', () => {
    const html = renderToStaticMarkup(
      <Gameplay
        mode="hard"
        timeLabel="03:47"
        player={{ name: 'Alice', score: 913 }}
        opponent={{ name: 'Bob', score: 4 }}
        words={['CAT']}
        entry="C"
        tiles={[]}
        onLetterSelect={noop}
        onBackspace={noop}
        onClear={noop}
        onShuffle={noop}
        onSubmit={noop}
        arena={<div>Custom animation</div>}
      />,
    );
    for (const text of ['03:47', 'Alice', '913', 'Bob', 'Custom animation'])
      expect(html).toContain(text);
    expect(html).not.toContain('Guest445');
  });
  for (const [mode, count, rows] of [
    ['easy', 6, [3, 3]],
    ['medium', 7, [4, 3]],
    ['hard', 8, [4, 4]],
  ] as const) {
    it(`renders ${mode} as ${rows.join('+')} tiles`, () => {
      const tiles = Array.from({ length: count }, (_, i) => ({
        id: String(i),
        letter: String.fromCharCode(65 + i),
      }));
      const html = renderToStaticMarkup(
        <LetterGrid mode={mode as Difficulty} tiles={tiles} onSelect={noop} />,
      );
      expect((html.match(/class="letter-tile/g) ?? []).length).toBe(count);
      expect((html.match(/class="letter-row/g) ?? []).length).toBe(2);
    });
  }
  it('identifies required letters and forwards disabled state', () => {
    const html = renderToStaticMarkup(
      <LetterTile
        tile={{ id: 't', letter: 'T', required: true, disabled: true }}
        onSelect={noop}
      />,
    );
    expect(html).toContain('T, required letter');
    expect(html).toContain('disabled=""');
  });
  it('switches word feedback only when provided by the host', () => {
    const plain = renderToStaticMarkup(<FoundWordsTray words={['CAT']} />);
    const feedback = renderToStaticMarkup(
      <FoundWordsTray words={['CAT']} feedback={{ message: 'GREAT WORD!', tone: 'success' }} />,
    );
    expect(plain).not.toContain('role="status"');
    expect(feedback).toContain('role="status"');
    expect(feedback).toContain('CAT');
  });
  it('disables backspace for an empty entry', () => {
    expect(renderToStaticMarkup(<WordEntry value="" onBackspace={noop} />)).toContain(
      'disabled=""',
    );
  });
  it('does not make action buttons accidental form submits', () => {
    expect(renderToStaticMarkup(<ActionButton>Action</ActionButton>)).toContain('type="button"');
  });
  it('isolates radio groups when two selectors are rendered together', () => {
    const options = [{ value: 'easy' as const, label: 'EASY', rules: [] }];
    const html = renderToStaticMarkup(
      <>
        <DifficultySelector value="easy" options={options} onChange={noop} />
        <DifficultySelector value="easy" options={options} onChange={noop} />
      </>,
    );
    const names = [...html.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(names).size).toBe(2);
  });
  it('accepts navigation active state and countdown content', () => {
    expect(renderToStaticMarkup(<BottomNav active="Store" onSelect={noop} />)).toContain(
      'aria-current="page"',
    );
    expect(renderToStaticMarkup(<Countdown count="GO!" caption="" />)).toContain('GO!');
  });
});
