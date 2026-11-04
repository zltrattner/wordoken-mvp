import { BottomNav, assets } from '../components/ui';
import { SettingsRow, TopBar } from '../components/chrome';

export interface SettingsProps {
  signedIn: boolean;
  onEditAvatar: () => void;
  onSubscription: () => void;
  onChangePassword: () => void;
  onSound: () => void;
  onAuth: () => void;
  onNavigate: (name: string) => void;
}

export function Settings(props: SettingsProps) {
  return (
    <main className="wordoken screen settings-screen" data-figma-node="39:694">
      <TopBar title="SETTINGS" />
      <div className="settings-list rail">
        <SettingsRow label="EDIT AVATAR" icon={assets.pencilColor} onClick={props.onEditAvatar} />
        <SettingsRow
          label="MANAGE SUBSCRIPTION"
          icon={assets.paperColor}
          onClick={props.onSubscription}
        />
        <SettingsRow
          label="CHANGE PASSWORD"
          icon={assets.keyColor}
          onClick={props.onChangePassword}
        />
        <SettingsRow label="SOUND SETTINGS" icon={assets.speakerColor} onClick={props.onSound} />
        <SettingsRow
          label={props.signedIn ? 'SIGN OUT' : 'SIGN UP'}
          icon={props.signedIn ? assets.signOutColor : assets.pencilColor}
          tone={props.signedIn ? 'red' : 'green'}
          onClick={props.onAuth}
        />
      </div>
      <BottomNav active="Settings" onSelect={props.onNavigate} />
    </main>
  );
}
