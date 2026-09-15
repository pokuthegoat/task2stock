const bars = [34, 52, 70, 88];

export function GrowthVisual() {
  return (
    <div className="growth-visual" aria-hidden="true">
      <div className="growth-bars">
        {bars.map((height, index) => (
          <span
            key={height}
            className="growth-bar"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-4 text-foreground/38">
        Illustration of rewards accumulating over time.
      </p>
    </div>
  );
}
