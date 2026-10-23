import { ActionButton, assets, Icon, SocialRow } from '../components/ui';

export interface StartProps {
  onStart: () => void;
  onService: (name: string) => void;
  muted: boolean;
  toggleMute: () => void;
}
export function Start({ onStart, onService, muted, toggleMute }: StartProps) {
  return (
    <main
      className="wordoken screen start-screen"
      aria-label="Wordoken start"
      data-figma-node="37:2"
    >
      <button
        type="button"
        className={`sound-button surface ${muted ? 'is-muted' : ''}`}
        aria-label={muted ? 'Turn sound on' : 'Mute sound'}
        aria-pressed={muted}
        onClick={toggleMute}
      >
        <Icon src={assets.sound} />
      </button>
      <div className="start-hero">
        <img className="brand-logo" src={assets.logo} alt="Wordoken!" />
        <p className="hero-callout surface">BECOME A WORD CHAMPION!</p>
      </div>
      <div className="start-actions rail">
        <ActionButton tone="white" className="hero-action" onClick={onStart}>
          START GAME
        </ActionButton>
        <ActionButton tone="green" className="hero-action" onClick={() => onService('Sign in')}>
          SIGN IN
        </ActionButton>
      </div>
      <div className="rail start-social">
        <SocialRow onSelect={onService} />
      </div>
    </main>
  );
}
