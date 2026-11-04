import { ActionButton, Icon, assets } from '../components/ui';
import { ChallengeCta } from '../components/chrome';

export type GameOutcome = 'win' | 'loss' | 'tie';
export interface RewardRow {
  label: string;
  coins: string | number;
  icon?: string;
}
export interface PostGameProps {
  outcome: GameOutcome;
  playerScore: string | number;
  opponentScore: string | number;
  xp: string | number;
  rewards: readonly RewardRow[];
  challengeLink: string;
  onChallenge: () => void;
  onContinue: () => void;
}

const titles = { win: 'YOU WON!', loss: 'YOU LOST', tie: 'IT’S A TIE' } as const;
const callouts = {
  win: 'YOU PLAYED A GREAT GAME!',
  loss: 'GOOD FIGHT!',
  tie: 'EVENLY MATCHED!',
} as const;

export function PostGame(props: PostGameProps) {
  const exuberant = props.outcome === 'win';
  return (
    <main
      className={`wordoken screen postgame-screen outcome-${props.outcome}`}
      data-figma-node={
        props.outcome === 'win' ? '38:375' : props.outcome === 'loss' ? '379:4860' : '379:5162'
      }
    >
      <header className="result-header rail">
        <span>{callouts[props.outcome]}</span>
        <h1 className="surface">{titles[props.outcome]}</h1>
      </header>
      {exuberant ? (
        <p className="result-summary rail surface">
          YOUR SCORE: {props.playerScore}
          <span>OPPONENT: {props.opponentScore}</span>
        </p>
      ) : (
        <div className="result-scores rail">
          <section className="surface">
            <h2>YOUR SCORE</h2>
            <p>{props.playerScore}</p>
          </section>
          <section className="surface">
            <h2>OPPONENT</h2>
            <p>{props.opponentScore}</p>
          </section>
        </div>
      )}
      <section className="reward-table rail surface" aria-label="Rewards">
        {props.rewards.map((row) => (
          <div key={row.label} className="reward-row">
            <span>{row.label}</span>
            <strong>
              {row.icon && <Icon src={row.icon} size={24} />}+{row.coins} COINS
            </strong>
          </div>
        ))}
      </section>
      {exuberant ? (
        <div className="xp-burst">
          <Icon src={assets.burstRed} size={430} />
          <strong>+{props.xp}</strong>
          <span>XP</span>
        </div>
      ) : (
        <div className="xp-quiet rail surface">
          <strong>+{props.xp}</strong>
          <span>XP</span>
        </div>
      )}
      <ChallengeCta link={props.challengeLink} onActivate={props.onChallenge} />
      <ActionButton
        className="postgame-continue rail"
        split={assets.arrow}
        onClick={props.onContinue}
      >
        CONTINUE
      </ActionButton>
    </main>
  );
}
