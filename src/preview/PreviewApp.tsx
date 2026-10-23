import { useState } from 'react';
import {
  ActionButton,
  Countdown,
  CurrencyBadge,
  Fighters,
  FoundWordsTray,
  GameTimer,
  Gameplay,
  Home,
  LetterTile,
  ScoreCard,
  SocialRow,
  Start,
  WordEntry,
  WordokenTheme,
} from '../index';
import type { Difficulty, WordFeedback } from '../types';
import { difficultyOptions, gameSamples } from './fixtures';

const views = ['start', 'home', 'easy', 'medium', 'hard', 'countdown', 'components'] as const;
type View = (typeof views)[number];
const requested = new URLSearchParams(location.search).get('view');
const initialView: View = views.includes(requested as View) ? (requested as View) : 'hard';

/** Development-only controls; callbacks are logged, never turned into game logic. */
export function PreviewApp() {
  const [view, setView] = useState<View>(initialView);
  const [mode, setMode] = useState<Difficulty>('easy');
  const [muted, setMuted] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState('none');
  const [event, setEvent] = useState('Select a component to inspect its callback.');
  const [count, setCount] = useState('3');
  const solo = new URLSearchParams(location.search).has('solo');
  const feedback: WordFeedback | undefined =
    feedbackKind === 'success'
      ? { message: 'GREAT WORD!', tone: 'success' }
      : feedbackKind === 'error'
        ? { message: 'Use every red letter.', tone: 'error' }
        : undefined;
  const log = (name: string) => setEvent(name);
  const changeView = (next: View) => {
    setView(next);
    const url = new URL(location.href);
    url.searchParams.set('view', next);
    history.replaceState(null, '', url);
  };
  const gameMode = view === 'easy' || view === 'medium' || view === 'hard' ? view : 'hard';
  return (
    <div className={`preview-shell ${solo ? 'solo' : ''}`}>
      {!solo && (
        <aside className="preview-sidebar">
          <h1>Wordoken UI</h1>
          <p>React components · visual review</p>
          <nav aria-label="Preview screens">
            {views.map((item) => (
              <button
                key={item}
                aria-current={view === item ? 'page' : undefined}
                onClick={() => changeView(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <label>
            Feedback state
            <select value={feedbackKind} onChange={(e) => setFeedbackKind(e.target.value)}>
              <option value="none">Found words</option>
              <option value="success">Great word</option>
              <option value="error">Validation message</option>
            </select>
          </label>
          <label>
            Countdown value
            <select value={count} onChange={(e) => setCount(e.target.value)}>
              {['3', '2', '1', 'GO!'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <p className="preview-explanation">
            No game engine, countdown clock, scoring, accounts, network calls or storage. All values
            are props.
          </p>
          <output aria-live="polite">{event}</output>
          <a href={`?view=${view}&solo`} target="_blank" rel="noreferrer">
            Open screen-only preview ↗
          </a>
        </aside>
      )}
      <div className="preview-stage">
        {view === 'start' && (
          <Start
            onStart={() => log('Start.onStart')}
            onService={(name) => log(`Start.onService(${name})`)}
            muted={muted}
            toggleMute={() => {
              setMuted((x) => !x);
              log('Start.toggleMute');
            }}
          />
        )}
        {view === 'home' && (
          <Home
            mode={mode}
            options={difficultyOptions}
            onModeChange={(next) => {
              setMode(next);
              log(`Home.onModeChange(${next})`);
            }}
            username="Guest445"
            level={12}
            coins={725}
            instruction={
              <>
                Make words that contain the red letter.
                <br />
                Score more points to win.
              </>
            }
            onStart={() => log('Home.onStart')}
            onExit={() => log('Home.onExit')}
            onService={(name) => log(`Home.onService(${name})`)}
          />
        )}
        {(view === 'easy' || view === 'medium' || view === 'hard') && (
          <Gameplay
            mode={gameMode}
            timeLabel="00:20"
            player={{ name: 'Guest445', score: 15 }}
            opponent={{ name: 'RobbieRobertson', score: 58 }}
            {...gameSamples[gameMode]}
            feedback={feedback}
            scoreGain="+5"
            onLetterSelect={(id) => log(`Gameplay.onLetterSelect(${id})`)}
            onBackspace={() => log('Gameplay.onBackspace')}
            onClear={() => log('Gameplay.onClear')}
            onShuffle={() => log('Gameplay.onShuffle')}
            onSubmit={() => log('Gameplay.onSubmit')}
          />
        )}
        {view === 'countdown' && (
          <Countdown count={count} caption={count === 'GO!' ? '' : 'GET READY'} />
        )}
        {view === 'components' && (
          <WordokenTheme className="component-catalog">
            <h2>Shared components</h2>
            <section>
              <h3>Actions</h3>
              <ActionButton onClick={() => log('ActionButton.onClick')}>
                PRIMARY ACTION
              </ActionButton>
              <ActionButton tone="green" onClick={() => log('ActionButton.onClick')}>
                SECONDARY ACTION
              </ActionButton>
            </section>
            <section>
              <h3>Player information</h3>
              <CurrencyBadge level={12} coins={725} onClick={() => log('CurrencyBadge.onClick')} />
              <ScoreCard name="Guest445" score={15} />
            </section>
            <section>
              <h3>Gameplay</h3>
              <GameTimer label="00:20" />
              <Fighters />
              <FoundWordsTray words={gameSamples.hard.words} feedback={feedback} />
              <WordEntry value="COMPUTER" onBackspace={() => log('WordEntry.onBackspace')} />
              <div className="tile-specimens">
                <LetterTile tile={{ id: 'default', letter: 'A' }} onSelect={log} />
                <LetterTile tile={{ id: 'required', letter: 'T', required: true }} onSelect={log} />
                <LetterTile tile={{ id: 'disabled', letter: 'E', disabled: true }} onSelect={log} />
              </div>
            </section>
            <section>
              <h3>Social providers</h3>
              <SocialRow onSelect={log} />
            </section>
          </WordokenTheme>
        )}
      </div>
    </div>
  );
}
