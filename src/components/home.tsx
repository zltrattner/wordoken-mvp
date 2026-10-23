import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Difficulty, DifficultyOptionData } from '../types';
import { assets, Icon } from './ui';

export interface UsernameControlProps {
  username: string;
  onEdit: () => void;
  editLabel?: string;
}

export function UsernameControl({
  username,
  onEdit,
  editLabel = 'Edit avatar',
}: UsernameControlProps) {
  return (
    <div className="username surface">
      <span>{username}</span>
      <button type="button" aria-label={editLabel} onClick={onEdit}>
        <Icon src={assets.pencil} />
      </button>
    </div>
  );
}

export function InstructionBlock({ children }: { children: ReactNode }) {
  return (
    <div className="instructions surface">
      <p>{children}</p>
    </div>
  );
}

export interface DifficultySelectorProps {
  value: Difficulty;
  options: readonly DifficultyOptionData[];
  onChange: (value: Difficulty) => void;
  label?: string;
}

export function DifficultySelector({
  value,
  options,
  onChange,
  label = 'SELECT DIFFICULTY',
}: DifficultySelectorProps) {
  const name = useId();
  return (
    <fieldset className="difficulty">
      <legend className="section-tab surface">{label}</legend>
      <div className="difficulty-panel surface">
        {options.map((option) => (
          <label className="difficulty-option" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <Icon src={value === option.value ? assets.radioSelected : assets.radio} size={34} />
            <span className="difficulty-content">
              <span className={`difficulty-badge ${option.value}`}>{option.label}</span>
              <span className="difficulty-rules">
                {option.rules.map((rule) => (
                  <span key={rule}>•&nbsp; {rule}</span>
                ))}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
