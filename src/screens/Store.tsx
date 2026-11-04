import { BottomNav, CurrencyBadge, Icon } from '../components/ui';
import { TopBar } from '../components/chrome';

export interface StoreItem {
  id: string;
  name: string;
  price?: string;
  locked?: string;
  art?: string;
}

export interface StoreProps {
  level: string | number;
  coins: string | number;
  items: readonly StoreItem[];
  onSelectItem: (id: string) => void;
  onSubscribe: () => void;
  onCurrency: () => void;
  onNavigate: (name: string) => void;
}

export function Store(props: StoreProps) {
  return (
    <main className="wordoken screen store-screen" data-figma-node="37:220">
      <TopBar
        title="STORE"
        trailing={
          <CurrencyBadge level={props.level} coins={props.coins} onClick={props.onCurrency} />
        }
      />
      <div className="store-grid rail" aria-label="Store items">
        {props.items.map((item) => (
          <button
            className="store-tile surface"
            type="button"
            key={item.id}
            onClick={() => props.onSelectItem(item.id)}
          >
            <span className={`store-banner ${item.locked ? 'locked' : ''}`}>
              {item.locked ? `▣ ${item.locked}` : item.price}
            </span>
            <span className="store-art">
              {item.art ? <Icon src={item.art} size={52} /> : <span aria-hidden="true">?</span>}
            </span>
            <span className="store-name">{item.name}</span>
          </button>
        ))}
      </div>
      <section className="store-promo rail">
        <h2>WANT MORE GAMES?</h2>
        <button type="button" className="store-promo-action surface" onClick={props.onSubscribe}>
          <span>SUBSCRIBE FOR SPECIAL PRIZES</span>
          <span>→</span>
        </button>
      </section>
      <BottomNav active="Store" onSelect={props.onNavigate} />
    </main>
  );
}
