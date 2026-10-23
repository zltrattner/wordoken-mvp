import { useEffect, useId, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { artwork } from '../assets';

export function WordokenTheme({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`wordoken ${className}`}>{children}</div>;
}

export const assets = artwork;

export function Icon({
  src,
  size = 24,
  className = '',
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={`icon ${className}`}
      src={src}
      width={size}
      height={size}
      alt=""
      draggable="false"
    />
  );
}

export function ActionButton({
  children,
  tone = 'yellow',
  split,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'yellow' | 'green' | 'white';
  split?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`action surface tone-${tone} ${split ? 'split-action' : ''} ${className}`}
      {...props}
    >
      <span className="action-label">{children}</span>
      {split && (
        <span className="action-icon">
          <Icon src={split} />
        </span>
      )}
    </button>
  );
}

export function CurrencyBadge({
  level,
  coins,
  onClick,
}: {
  level: string | number;
  coins: string | number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="currency surface"
      onClick={onClick}
      aria-label={`Level ${level}, ${coins} coins. Open store`}
    >
      <span className="level">{level}</span>
      <span className="balance">
        <Icon src={assets.coin} size={18} />
        {coins}
      </span>
    </button>
  );
}

export function BottomNav({
  onSelect,
  active = 'Home',
}: {
  onSelect: (name: string) => void;
  active?: 'Home' | 'Archive' | 'Store' | 'Settings';
}) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {['Home', 'Archive', 'Store', 'Settings'].map((name) => (
        <button
          type="button"
          key={name}
          onClick={() => onSelect(name)}
          aria-current={name === active ? 'page' : undefined}
        >
          <span className={`nav-box surface ${name !== active ? 'muted' : ''}`}>
            {name === 'Archive' ? (
              <span className="book-art">
                <img src={assets.bookBase} alt="" />
                <img src={assets.bookOutline} alt="" />
              </span>
            ) : (
              <Icon
                size={46}
                src={
                  name === 'Home' ? assets.house : name === 'Store' ? assets.cart : assets.settings
                }
              />
            )}
          </span>
          <span className="nav-label">{name}</span>
        </button>
      ))}
    </nav>
  );
}

export interface SocialProvider {
  id: string;
  label: string;
  icon: string;
}
export interface SocialRowProps {
  onSelect: (providerId: string) => void;
  providers?: readonly SocialProvider[];
  label?: string;
  labelColor?: 'black' | 'white';
}
const defaultProviders: readonly SocialProvider[] = [
  { id: 'tiktok', label: 'TikTok', icon: assets.tiktok },
  { id: 'instagram', label: 'Instagram', icon: assets.instagram },
  { id: 'google', label: 'Google', icon: assets.google },
  { id: 'facebook', label: 'Facebook', icon: assets.facebook },
];
export function SocialRow({
  onSelect,
  providers = defaultProviders,
  label = 'OR SIGN IN WITH',
  labelColor = 'black',
}: SocialRowProps) {
  return (
    <section className={`social-group label-${labelColor}`} aria-label="Social sign in">
      <p>{label}</p>
      <div className="social-row">
        {providers.map((provider) => (
          <button
            type="button"
            key={provider.id}
            className="social-button surface"
            onClick={() => onSelect(provider.id)}
            aria-label={`Sign in with ${provider.label}`}
          >
            <Icon src={provider.icon} size={48} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function Dialog({
  title,
  children,
  onClose,
  action,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  action?: { label: string; onClick: () => void };
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const prior = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      prior?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog surface"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="dialog-body">{children}</div>
      <div className="dialog-actions">
        {action && (
          <ActionButton tone="green" onClick={action.onClick}>
            {action.label}
          </ActionButton>
        )}
        <ActionButton tone="white" onClick={onClose}>
          CLOSE
        </ActionButton>
      </div>
    </dialog>
  );
}
