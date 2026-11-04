import { ActionButton, BottomNav, CurrencyBadge, assets } from '../components/ui';
import { TopBar } from '../components/chrome';

export interface ArchiveEntry {
  id: string;
  result: 'win' | 'loss' | 'tie';
  opponent: string;
  ago: string;
  percent: string | number;
}

export interface ArchiveProps {
  level: string | number;
  coins: string | number;
  wins: number;
  ties: number;
  losses: number;
  entries: readonly ArchiveEntry[];
  signedIn?: boolean;
  onCurrency: () => void;
  onOpen: (id: string) => void;
  onSignUp: () => void;
  onNavigate: (name: string) => void;
}

export function Archive(props: ArchiveProps) {
  return (
    <main className="wordoken screen archive-screen" data-figma-node="39:511">
      <TopBar
        title=""
        trailing={
          <CurrencyBadge level={props.level} coins={props.coins} onClick={props.onCurrency} />
        }
      />
      <section className="archive-stats rail">
        {(
          [
            ['WINS', props.wins, 'win'],
            ['TIES', props.ties, 'tie'],
            ['LOSSES', props.losses, 'loss'],
          ] as const
        ).map(([label, value, result]) => (
          <div key={label} className={`archive-stat ${result}`}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </section>
      <p className="archive-hint surface rail">Tap a game to re-open.</p>
      <div className="archive-list rail">
        {props.entries.map((entry) => (
          <button
            type="button"
            className="archive-entry"
            key={entry.id}
            onClick={() => props.onOpen(entry.id)}
          >
            <span className={`archive-result ${entry.result}`}>{entry.result.toUpperCase()}</span>
            <span className="archive-opponent surface">VS. {entry.opponent}</span>
            <span className="archive-meta">
              <span>{entry.ago}</span>
              <span>{entry.percent}%</span>
            </span>
          </button>
        ))}
      </div>
      {!props.signedIn && (
        <ActionButton className="archive-signup rail" split={assets.arrow} onClick={props.onSignUp}>
          SIGN UP TO SAVE GAMES
        </ActionButton>
      )}
      <BottomNav active="Archive" onSelect={props.onNavigate} />
    </main>
  );
}
