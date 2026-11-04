import type { ReactNode } from 'react';
import { assets, Icon } from './ui';

export function TopBar({
  title,
  onBack,
  onSound,
  trailing,
}: {
  title: string;
  onBack?: () => void;
  onSound?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <header className="topbar">
      {onBack && (
        <button className="topbar-control surface" type="button" onClick={onBack} aria-label="Back">
          <span aria-hidden="true">←</span>
        </button>
      )}
      <h1 className="topbar-title surface">{title}</h1>
      <div className="topbar-trailing">
        {trailing}
        {onSound && (
          <button
            className="topbar-control surface"
            type="button"
            onClick={onSound}
            aria-label="Sound settings"
          >
            <Icon src={assets.speakerColor} size={25} />
          </button>
        )}
      </div>
    </header>
  );
}

export function ProfileStats({ level, coins }: { level: string | number; coins: string | number }) {
  return (
    <div className="profile-stats surface" aria-label={`Level ${level}, ${coins} coins`}>
      <span>LEVEL {level}</span>
      <span>
        <Icon src={assets.coin} size={20} />
        {coins}
      </span>
    </div>
  );
}

export function ChallengeCta({ link, onActivate }: { link: string; onActivate: () => void }) {
  return (
    <button
      className="challenge-cta"
      type="button"
      onClick={onActivate}
      aria-label="Copy challenge link"
    >
      <span className="challenge-title">CHALLENGE YOUR FRIENDS!</span>
      <span className="challenge-row surface">
        <span className="challenge-link">{link}</span>
        <span className="challenge-copy">COPY LINK</span>
      </span>
    </button>
  );
}

export function SettingsRow({
  label,
  icon,
  tone = 'yellow',
  onClick,
}: {
  label: string;
  icon: string;
  tone?: 'yellow' | 'green' | 'red';
  onClick: () => void;
}) {
  return (
    <button className={`settings-row surface settings-${tone}`} type="button" onClick={onClick}>
      <span>{label}</span>
      <span className="settings-icon">
        <Icon src={icon} size={44} />
      </span>
    </button>
  );
}
