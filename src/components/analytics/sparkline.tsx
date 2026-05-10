interface Props {
  buckets: number[];
  className?: string;
}

export function ActivitySparkline({ buckets, className }: Props) {
  const max = Math.max(1, ...buckets);
  const w = 800;
  const h = 120;
  const padX = 4;
  const innerW = w - padX * 2;
  const barW = innerW / buckets.length;
  const baseline = h - 16;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Daily task completions over the last 30 days"
        className="w-full h-32"
      >
        <line x1={0} x2={w} y1={baseline} y2={baseline} stroke="currentColor" className="text-border" strokeWidth="1" />
        {[0, 7, 14, 21, 28].map((d) => (
          <line
            key={d}
            x1={padX + d * barW}
            x2={padX + d * barW}
            y1={baseline}
            y2={baseline + 5}
            stroke="currentColor"
            className="text-border-strong"
            strokeWidth="1"
          />
        ))}
        {buckets.map((v, i) => {
          const barH = (v / max) * (baseline - 8);
          const x = padX + i * barW + 1;
          const y = baseline - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={Math.max(2, barW - 3)}
              height={Math.max(2, barH)}
              rx={2}
              className={v === 0 ? 'fill-border' : 'fill-brand'}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-ink-faint">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
