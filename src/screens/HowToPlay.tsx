import { ActionButton, Icon, assets } from '../components/ui';
import { TopBar } from '../components/chrome';
import { LetterGrid, WordEntry } from '../components/gameplay';
import { Fighters } from '../components/Fighters';
import type { LetterTileData } from '../types';

export type TutorialStep = 'words' | 'difficulty' | 'controls' | 'customize';
export interface HowToPlayProps {
  step: TutorialStep;
  onExit: () => void;
  onSound: () => void;
  onPrevious?: () => void;
  onNext: () => void;
}

const tutorialTiles: LetterTileData[] = [...'CATUREP'].map((letter, index) => ({
  id: `${letter}-${index}`,
  letter,
  required: letter === 'T',
}));

function StepContent({ step }: { step: TutorialStep }) {
  if (step === 'words')
    return (
      <>
        <section className="tutorial-copy">
          <h2 className="section-tab">MAKE WORDS</h2>
          <div className="surface">
            <p>Make words from the given letters.</p>
            <p>Every word must contain the red letter.</p>
          </div>
        </section>
        <div className="tutorial-demo surface">
          <WordEntry value="CAPTURE" onBackspace={() => undefined} disabled />
          <p className="red-required">RED = REQUIRED</p>
          <LetterGrid mode="medium" tiles={tutorialTiles} onSelect={() => undefined} />
        </div>
      </>
    );
  if (step === 'difficulty')
    return (
      <>
        <section className="tutorial-copy">
          <h2 className="section-tab">SELECT DIFFICULTY</h2>
          <div className="surface">
            <p>Choose how many letters and red letters you want.</p>
            <p>You have five minutes to score more points than your opponent.</p>
          </div>
        </section>
        <div className="tutorial-demo tutorial-difficulty surface">
          <Icon src={assets.timerIcon} size={64} />
          <strong>05:00</strong>
          <div>
            <b>EASY</b>
            <span>6 LETTERS</span>
          </div>
          <div>
            <b>MEDIUM</b>
            <span>7 LETTERS</span>
          </div>
          <div>
            <b>HARD</b>
            <span>8 LETTERS</span>
          </div>
        </div>
      </>
    );
  if (step === 'controls')
    return (
      <>
        <section className="tutorial-copy">
          <h2 className="section-tab">SCORE MORE POINTS</h2>
          <div className="surface">
            <p>Longer words earn more points.</p>
            <p>
              Scroll found words to review them. Backspace deletes a letter; Clear empties the
              entry; Shuffle mixes the tiles; Submit checks your word.
            </p>
          </div>
        </section>
        <div className="tutorial-demo tutorial-controls surface">
          <WordEntry value="CAPTURE" onBackspace={() => undefined} disabled />
          <div className="pro-tip">
            <strong>PRO TIP</strong>
            <span>Use every letter for a Wordoken bonus.</span>
          </div>
          <div className="tutorial-actions">
            <b>CLEAR</b>
            <b>SHUFFLE</b>
            <b>SUBMIT</b>
          </div>
        </div>
      </>
    );
  return (
    <>
      <section className="tutorial-copy">
        <h2 className="section-tab">CHALLENGE FRIENDS</h2>
        <div className="surface">
          <p>Copy your challenge link after a game and send it anywhere.</p>
          <p>Friends can play your exact challenge without using a daily game.</p>
        </div>
      </section>
      <div className="tutorial-demo tutorial-customize surface">
        <h3>MAKE IT YOURS</h3>
        <Fighters />
        <div className="mini-gear">
          <Icon src={assets.bandanaRed} size={48} />
          <Icon src={assets.pencilGear} size={48} />
          <Icon src={assets.bandanaBlue} size={48} />
        </div>
      </div>
    </>
  );
}

export function HowToPlay(props: HowToPlayProps) {
  const node = {
    words: '291:4434',
    difficulty: '291:4528',
    controls: '291:4628',
    customize: '291:4721',
  }[props.step];
  return (
    <main className="wordoken screen tutorial-screen" data-figma-node={node}>
      <TopBar title="HOW TO PLAY" onBack={props.onExit} onSound={props.onSound} />
      <div className="tutorial-body rail">
        <StepContent step={props.step} />
      </div>
      <div className="tutorial-footer rail">
        <ActionButton tone="white" disabled={!props.onPrevious} onClick={props.onPrevious}>
          PREVIOUS
        </ActionButton>
        <ActionButton onClick={props.onNext}>
          {props.step === 'customize' ? 'DONE' : 'NEXT'}
        </ActionButton>
      </div>
    </main>
  );
}
