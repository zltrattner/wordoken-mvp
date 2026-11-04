import { ActionButton, assets } from '../components/ui';
import type { Difficulty, DifficultyOptionData } from '../types';
import { InstructionBlock } from '../components/home';
import { TopBar } from '../components/chrome';

export interface ChallengeInviteProps {
  challenger: string;
  difficulty: Difficulty;
  option: DifficultyOptionData;
  onSound: () => void;
  onHowToPlay: () => void;
  onSignIn: () => void;
  onStart: () => void;
}

export function ChallengeInvite(props: ChallengeInviteProps) {
  return (
    <main className="wordoken screen invite-screen" aria-label="Wordoken challenge invitation">
      <TopBar title="WORDOKEN" onSound={props.onSound} />
      <div className="invite-body rail">
        <section className="invite-callout surface">
          <span>YOU’VE BEEN CHALLENGED BY</span>
          <strong>{props.challenger}</strong>
        </section>
        <InstructionBlock>
          Make words that contain the red letter.
          <br />
          Score more points to win.
        </InstructionBlock>
        <section className="invite-rules surface">
          <h2>{props.difficulty.toUpperCase()} GAME</h2>
          <ul>
            {props.option.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
        <ActionButton className="invite-how" split={assets.question} onClick={props.onHowToPlay}>
          HOW TO PLAY
        </ActionButton>
        <ActionButton
          className="invite-start"
          tone="green"
          split={assets.arrow}
          onClick={props.onStart}
        >
          START GAME
        </ActionButton>
        <button type="button" className="invite-signin" onClick={props.onSignIn}>
          ALREADY PLAY? <strong>SIGN IN</strong>
        </button>
      </div>
    </main>
  );
}
