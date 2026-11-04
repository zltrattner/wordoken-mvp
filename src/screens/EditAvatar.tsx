import type { ReactNode } from 'react';
import { ActionButton, CurrencyBadge, Icon, assets } from '../components/ui';
import { ProfileStats, TopBar } from '../components/chrome';
import { Fighters } from '../components/Fighters';

export interface AvatarOption {
  id: string;
  label: string;
  art?: string;
  selected?: boolean;
}

export interface EditAvatarProps {
  username: string;
  level: string | number;
  coins: string | number;
  signedIn: boolean;
  options: readonly AvatarOption[];
  avatar?: ReactNode;
  onBack: () => void;
  onCurrency: () => void;
  onEditUsername: () => void;
  onCreateAccount: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectOption: (id: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function EditAvatar(props: EditAvatarProps) {
  return (
    <main className="wordoken screen avatar-screen" data-figma-node="38:521">
      <TopBar
        title="EDIT AVATAR"
        onBack={props.onBack}
        trailing={
          <CurrencyBadge level={props.level} coins={props.coins} onClick={props.onCurrency} />
        }
      />
      <section className="avatar-user rail">
        <span className="field-tab">USERNAME</span>
        <button className="avatar-name surface" type="button" onClick={props.onEditUsername}>
          <span>{props.username}</span>
          <span>
            <Icon src={assets.pencilColor} size={28} />
          </span>
        </button>
        <ProfileStats level={props.level} coins={props.coins} />
      </section>
      {!props.signedIn && (
        <button className="avatar-account rail" type="button" onClick={props.onCreateAccount}>
          <strong>CREATE ACCOUNT</strong> TO EDIT YOUR AVATAR
        </button>
      )}
      <div className="avatar-preview surface rail">{props.avatar ?? <Fighters />}</div>
      <section className="gear-picker rail">
        <h2 className="section-tab">TAP TO SELECT/RESELECT</h2>
        <div className="gear-window surface">
          <button
            type="button"
            className="gear-arrow left"
            onClick={props.onPrevious}
            aria-label="Previous items"
          >
            ◀
          </button>
          <div className="gear-options">
            {props.options.map((option) => (
              <button type="button" key={option.id} onClick={() => props.onSelectOption(option.id)}>
                {option.selected && <span className="gear-check">✓</span>}
                {option.art ? (
                  <Icon src={option.art} size={50} />
                ) : (
                  <span className="gear-placeholder" />
                )}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="gear-arrow right"
            onClick={props.onNext}
            aria-label="Next items"
          >
            ▶
          </button>
        </div>
      </section>
      <div className="avatar-actions rail">
        <ActionButton onClick={props.onCancel}>CANCEL</ActionButton>
        <ActionButton tone="green" onClick={props.onSave}>
          SAVE
        </ActionButton>
      </div>
    </main>
  );
}
