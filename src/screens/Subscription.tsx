import { ActionButton, Icon, assets } from '../components/ui';
import { TopBar } from '../components/chrome';

export interface SubscriptionProps {
  active?: boolean;
  price?: string;
  onBack: () => void;
  onAction: () => void;
}

export function Subscription({
  active = false,
  price = '$4.99',
  onBack,
  onAction,
}: SubscriptionProps) {
  return (
    <main
      className="wordoken screen subscription-screen"
      data-figma-node={active ? '285:2878' : '285:2609'}
    >
      <TopBar title="MANAGE SUBSCRIPTION" onBack={onBack} />
      <section className="subscription rail">
        <h2 className="section-tab">{active ? 'CURRENT PLAN' : 'MEMBERSHIP'}</h2>
        <div className="subscription-card surface">
          <p className="subscription-name">WORDOKEN PLUS</p>
          <p className="subscription-price">
            <strong>{price}</strong>
            <span>/ MONTH</span>
          </p>
          <div className="subscription-divider" />
          <div className="benefit">
            <Icon src={assets.controllers} size={54} />
            <span>
              <strong>UNLIMITED GAMES</strong>Play whenever you want.
            </span>
          </div>
          <div className="benefit">
            <Icon src={assets.chest} size={54} />
            <span>
              <strong>SPECIAL PRIZES</strong>Member-only rewards.
            </span>
          </div>
        </div>
      </section>
      <ActionButton className="subscription-action rail" split={assets.arrow} onClick={onAction}>
        {active ? 'MANAGE PLAN' : 'SUBSCRIBE'}
      </ActionButton>
    </main>
  );
}
