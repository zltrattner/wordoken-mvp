import { ActionButton, Icon, assets } from '../components/ui';
import { LabeledField } from '../components/forms';
import { TopBar } from '../components/chrome';

export type LinkedProvider = 'google' | 'facebook' | 'tiktok';
export interface LinkedAccountSignUpProps {
  provider: LinkedProvider;
  accountName: string;
  accountDetail?: string;
  usernameError?: string;
  onBack: () => void;
  onSound: () => void;
  onChangeAccount: () => void;
  onSubmit: () => void;
}

const providerMeta = {
  google: { label: 'Google', icon: assets.google, color: '#fff', ink: '#3c4043' },
  facebook: { label: 'Facebook', icon: assets.facebook, color: '#1877f2', ink: '#fff' },
  tiktok: { label: 'TikTok', icon: assets.tiktok, color: '#010101', ink: '#fff' },
} as const;

export function LinkedAccountSignUp(props: LinkedAccountSignUpProps) {
  const meta = providerMeta[props.provider];
  return (
    <main
      className="wordoken screen linked-screen"
      data-figma-node={
        props.provider === 'facebook'
          ? '300:3857'
          : props.provider === 'google'
            ? '39:799'
            : '327:4178'
      }
    >
      <TopBar title="SIGN UP" onBack={props.onBack} onSound={props.onSound} />
      <section className="linked-module rail">
        <h2 className="section-tab">LINK ACCOUNT</h2>
        <div
          className="provider-card surface"
          style={{ '--provider': meta.color, '--provider-ink': meta.ink } as React.CSSProperties}
        >
          <Icon src={meta.icon} size={70} />
          <p>Continue with {meta.label}</p>
          <strong>{props.accountName}</strong>
          {props.accountDetail && <span>{props.accountDetail}</span>}
          <button type="button" onClick={props.onChangeAccount}>
            Use another account
          </button>
        </div>
      </section>
      <form
        className="linked-form rail"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <LabeledField label="USERNAME" placeholder="username" error={props.usernameError} />
        <ActionButton type="submit">SIGN UP</ActionButton>
      </form>
    </main>
  );
}
