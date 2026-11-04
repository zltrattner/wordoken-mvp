import { ActionButton, assets } from '../components/ui';
import { EyeToggle, LabeledField, PasswordRules } from '../components/forms';
import { TopBar } from '../components/chrome';

export interface ChangePasswordProps {
  onBack: () => void;
  onSubmit: () => void;
  onTogglePassword?: (field: 'old' | 'new' | 'confirm') => void;
}

export function ChangePassword(props: ChangePasswordProps) {
  return (
    <main className="wordoken screen password-screen" data-figma-node="38:442">
      <TopBar title="CHANGE PASSWORD" onBack={props.onBack} />
      <div className="password-body rail">
        <PasswordRules />
        {(['old', 'new', 'confirm'] as const).map((field) => (
          <LabeledField
            key={field}
            label={`${field === 'confirm' ? 'CONFIRM' : field.toUpperCase()} PASSWORD`}
            type="password"
            icon={assets.keyColor}
            end={<EyeToggle onClick={() => props.onTogglePassword?.(field)} />}
          />
        ))}
        <ActionButton split={assets.arrow} onClick={props.onSubmit}>
          CHANGE PASSWORD
        </ActionButton>
      </div>
    </main>
  );
}
