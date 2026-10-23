export function Countdown({
  count,
  caption = 'GET READY',
}: {
  count: string | number;
  caption?: string;
}) {
  return (
    <main
      className="wordoken screen countdown-screen"
      aria-label="Get ready"
      data-figma-node="505:7019"
    >
      <div className="countdown">
        <div className="count" aria-live="polite">
          {count}
        </div>
        <div className="count-caption">{caption || '\u00a0'}</div>
      </div>
    </main>
  );
}
