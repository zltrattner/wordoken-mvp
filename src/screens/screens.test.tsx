import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Archive } from './Archive';
import { ChallengeInvite } from './ChallengeInvite';
import { HowToPlay } from './HowToPlay';
import { LinkedAccountSignUp } from './LinkedAccountSignUp';
import { PostGame } from './PostGame';
import { Settings } from './Settings';
import { Subscription } from './Subscription';

const noop = () => undefined;
const winRewards = [
  { label: 'Word Score', coins: 28 },
  { label: 'Victory', coins: 25 },
  { label: 'Fast KO Bonus', coins: 25 },
];
const standardRewards = [{ label: 'Word Score', coins: 28 }];
const sampleArchiveEntries = [
  { id: '1', result: 'win' as const, opponent: 'NinjaWolf', ago: '1 DAY AGO', percent: 80 },
];
describe('remaining screen contracts', () => {
  it('keeps loss and tie rewards quieter than the win table', () => {
    const win = renderToStaticMarkup(
      <PostGame
        outcome="win"
        playerScore={8}
        opponentScore={3}
        xp={12}
        rewards={winRewards}
        challengeLink="x"
        onChallenge={noop}
        onContinue={noop}
      />,
    );
    const loss = renderToStaticMarkup(
      <PostGame
        outcome="loss"
        playerScore={3}
        opponentScore={8}
        xp={5}
        rewards={standardRewards}
        challengeLink="x"
        onChallenge={noop}
        onContinue={noop}
      />,
    );
    expect(win).toContain('Victory');
    expect(win).toContain('Fast KO Bonus');
    expect(loss).not.toContain('Victory');
    expect(loss).not.toContain('Fast KO Bonus');
  });
  it('renders every linked-account provider from one component', () => {
    for (const provider of ['google', 'facebook', 'tiktok'] as const) {
      const html = renderToStaticMarkup(
        <LinkedAccountSignUp
          provider={provider}
          accountName="Player"
          onBack={noop}
          onSound={noop}
          onChangeAccount={noop}
          onSubmit={noop}
        />,
      );
      expect(html.toLowerCase()).toContain(provider);
    }
  });
  it('renders active and inactive subscription labels', () => {
    expect(renderToStaticMarkup(<Subscription onBack={noop} onAction={noop} />)).toContain(
      'SUBSCRIBE',
    );
    expect(renderToStaticMarkup(<Subscription active onBack={noop} onAction={noop} />)).toContain(
      'CURRENT PLAN',
    );
  });
  it('makes guest settings an ordinary sign-up action', () => {
    const html = renderToStaticMarkup(
      <Settings
        signedIn={false}
        onEditAvatar={noop}
        onSubscription={noop}
        onChangePassword={noop}
        onSound={noop}
        onAuth={noop}
        onNavigate={noop}
      />,
    );
    expect(html).toContain('SIGN UP');
    expect(html).not.toContain('SIGN OUT');
  });
  it('retains all active tutorial steps and the invite brief', () => {
    for (const step of ['words', 'difficulty', 'controls', 'customize'] as const) {
      expect(
        renderToStaticMarkup(<HowToPlay step={step} onExit={noop} onSound={noop} onNext={noop} />),
      ).toContain('HOW TO PLAY');
    }
    const invite = renderToStaticMarkup(
      <ChallengeInvite
        challenger="Guest445"
        difficulty="medium"
        option={{ value: 'medium', label: 'MEDIUM', rules: ['7 LETTERS'] }}
        onSound={noop}
        onHowToPlay={noop}
        onSignIn={noop}
        onStart={noop}
      />,
    );
    expect(invite).toContain('Guest445');
    expect(invite).toContain('7 LETTERS');
  });
  it('keeps archive entries supplied by the host', () => {
    const html = renderToStaticMarkup(
      <Archive
        level={1}
        coins={0}
        wins={1}
        ties={2}
        losses={3}
        entries={sampleArchiveEntries}
        onCurrency={noop}
        onOpen={noop}
        onSignUp={noop}
        onNavigate={noop}
      />,
    );
    expect(html).toContain('NinjaWolf');
    expect((html.match(/archive-entry/g) ?? []).length).toBe(sampleArchiveEntries.length);
  });
});
