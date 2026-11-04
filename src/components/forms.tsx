import type { InputHTMLAttributes, ReactNode } from 'react';
import { assets, Icon } from './ui';

export function LabeledField({
  label,
  icon,
  end,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: string;
  end?: ReactNode;
  error?: string;
}) {
  return (
    <label className="field-group">
      <span className="field-tab">{label}</span>
      <span className="field-control surface">
        {icon && <Icon src={icon} size={30} />}
        <input {...props} />
        {end}
      </span>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function PasswordRules() {
  return (
    <section className="password-rules surface" aria-label="Password requirements">
      <span className="password-lock">
        <Icon src={assets.lockLarge} size={66} />
      </span>
      <ul>
        <li>
          <span className="rule-bad">×</span>At least 8 characters
        </li>
        <li>
          <span className="rule-good">✓</span>At least 1 number
        </li>
        <li>
          <span className="rule-good">✓</span>At least 1 special character
        </li>
      </ul>
    </section>
  );
}

export function SectionTab({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`section-tab ${className}`}>{children}</h2>;
}

export function EyeToggle({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="eye-toggle" onClick={onClick} aria-label="Show password">
      ◉̸
    </button>
  );
}
