import { ActionButton, Icon, assets } from '../components/ui';
import { TopBar } from '../components/chrome';

export interface SoundSettingsProps {
  music: number;
  effects: number;
  musicMuted?: boolean;
  effectsMuted?: boolean;
  onBack: () => void;
  onSound: () => void;
  onMusicChange: (value: number) => void;
  onEffectsChange: (value: number) => void;
  onToggleMusic: () => void;
  onToggleEffects: () => void;
  onDone: () => void;
}

function VolumePanel({
  label,
  value,
  muted,
  onChange,
  onToggle,
}: {
  label: string;
  value: number;
  muted?: boolean;
  onChange: (value: number) => void;
  onToggle: () => void;
}) {
  return (
    <section className="volume-group">
      <h2 className="section-tab">{label}</h2>
      <div className="volume-panel surface">
        <Icon src={assets.speakerColor} size={58} />
        <strong>{muted ? 'MUTED' : `${value}%`}</strong>
        <button type="button" onClick={onToggle}>
          {muted ? 'UNMUTE' : 'MUTE'}
        </button>
        <input
          aria-label={`${label} volume`}
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </section>
  );
}

export function SoundSettings(props: SoundSettingsProps) {
  return (
    <main className="wordoken screen sound-screen" data-figma-node="280:2490">
      <TopBar title="SOUND SETTINGS" onBack={props.onBack} onSound={props.onSound} />
      <div className="sound-body rail">
        <p className="sound-copy surface">
          Adjust music and sound effects separately. Your choices are controlled by the host app.
        </p>
        <VolumePanel
          label="MUSIC"
          value={props.music}
          muted={props.musicMuted}
          onChange={props.onMusicChange}
          onToggle={props.onToggleMusic}
        />
        <VolumePanel
          label="SOUND EFFECTS"
          value={props.effects}
          muted={props.effectsMuted}
          onChange={props.onEffectsChange}
          onToggle={props.onToggleEffects}
        />
        <ActionButton split={assets.arrow} onClick={props.onDone}>
          DONE
        </ActionButton>
      </div>
    </main>
  );
}
