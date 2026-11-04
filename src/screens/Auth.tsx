import { ActionButton, SocialRow } from '../components/ui';
import type { SocialProvider } from '../components/ui';
import { EyeToggle, LabeledField, PasswordRules } from '../components/forms';
import { TopBar } from '../components/chrome';

interface AuthBaseProps {
  onBack: () => void;
  onSound: () => void;
  onSubmit: () => void;
  onSocial: (provider: string) => void;
  providers?: readonly SocialProvider[];
}

export interface SignInProps extends AuthBaseProps {
  onSignUp: () => void;
  onForgotPassword: () => void;
}

export function SignIn(props: SignInProps) {
  return (
    <main className="wordoken screen auth-screen auth-signin" data-figma-node="37:53">
      <TopBar title="SIGN IN" onBack={props.onBack} onSound={props.onSound} />
      <button className="auth-switch" type="button" onClick={props.onSignUp}>
        NOT A MEMBER? <strong>SIGN UP NOW</strong>
      </button>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <LabeledField
          label="EMAIL OR USERNAME"
          placeholder="email or username"
          autoComplete="username"
        />
        <LabeledField
          label="PASSWORD"
          type="password"
          autoComplete="current-password"
          end={<EyeToggle />}
        />
        <button className="forgot-password" type="button" onClick={props.onForgotPassword}>
          FORGOT PASSWORD?
        </button>
        <ActionButton className="auth-submit" tone="yellow" type="submit">
          SIGN IN
        </ActionButton>
      </form>
      <SocialRow providers={props.providers} onSelect={props.onSocial} labelColor="white" />
    </main>
  );
}

export interface SignUpProps extends AuthBaseProps {
  usernameError?: string;
}

export function SignUp(props: SignUpProps) {
  return (
    <main className="wordoken screen auth-screen auth-signup" data-figma-node="37:135">
      <TopBar title="SIGN UP" onBack={props.onBack} onSound={props.onSound} />
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <LabeledField
          label="USERNAME"
          placeholder="username"
          autoComplete="username"
          error={props.usernameError}
        />
        <LabeledField
          label="EMAIL"
          type="email"
          placeholder="example@gmail.com"
          autoComplete="email"
        />
        <PasswordRules />
        <LabeledField
          label="PASSWORD"
          type="password"
          autoComplete="new-password"
          end={<EyeToggle />}
        />
        <ActionButton className="auth-submit" tone="yellow" type="submit">
          SIGN UP
        </ActionButton>
      </form>
      <SocialRow providers={props.providers} label="OR SIGN UP WITH" onSelect={props.onSocial} />
    </main>
  );
}
