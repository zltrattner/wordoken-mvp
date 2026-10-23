import { ActionButton, assets, BottomNav, CurrencyBadge } from '../components/ui';
import { DifficultySelector, InstructionBlock, UsernameControl } from '../components/home';
import type { ReactNode } from 'react';
import type { Difficulty, DifficultyOptionData } from '../types';

export interface HomeProps {
  mode: Difficulty;
  options: readonly DifficultyOptionData[];
  onModeChange: (mode: Difficulty) => void;
  onStart: () => void;
  onExit: () => void;
  onService: (name: string) => void;
  username: string;
  level: string | number;
  coins: string | number;
  instruction: ReactNode;
}
export function Home({
  mode,
  options,
  onModeChange,
  onStart,
  onExit,
  onService,
  username,
  level,
  coins,
  instruction,
}: HomeProps) {
  return (
    <main
      className="wordoken screen home-screen"
      aria-label="Choose a game"
      data-figma-node="38:281"
    >
      <div className="utility-row">
        <button type="button" className="exit-button surface" onClick={onExit}>
          EXIT
        </button>
        <CurrencyBadge level={level} coins={coins} onClick={() => onService('Store')} />
      </div>
      <div className="rail home-body">
        <UsernameControl username={username} onEdit={() => onService('Edit avatar')} />
        <InstructionBlock>{instruction}</InstructionBlock>
        <DifficultySelector value={mode} options={options} onChange={onModeChange} />
        <ActionButton
          split={assets.question}
          className="how-button"
          onClick={() => onService('How to play')}
        >
          HOW TO PLAY
        </ActionButton>
        <ActionButton
          tone="green"
          split={assets.arrow}
          className="start-game-button"
          onClick={onStart}
        >
          START GAME
        </ActionButton>
        <BottomNav
          onSelect={(name) => {
            if (name !== 'Home') onService(name);
          }}
        />
      </div>
    </main>
  );
}
