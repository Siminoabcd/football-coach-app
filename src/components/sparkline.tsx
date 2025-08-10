type Props = {
    values: number[];          // e.g., ratings over time
    width?: number;            // px
    height?: number;           // px
    strokeWidth?: number;      // px
    ariaLabel?: string;
    showDots?: boolean;
  };
  
  export default function Sparkline({
    values,
    width = 240,
    height = 40,
    strokeWidth = 2,
    ariaLabel = "sparkline",
    showDots = true,
  }: Props) {
    if (!values.length) {
      return (
        <svg width={width} height={height} aria-label={ariaLabel} role="img">
          <title>{ariaLabel}</title>
        </svg>
      );
    }
  
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1; // avoid div by zero
  
    const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  
    const points = values.map((v, i) => {
      const x = i * stepX;
      const norm = (v - min) / span;
      const y = height - norm * (height - strokeWidth) - strokeWidth / 2; // top=high
      return { x, y };
    });
  
    const d = points
      .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
      .join(" ");
  
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label={ariaLabel}
        role="img"
        className="text-foreground/80"
      >
        <title>{ariaLabel}</title>
        {/* line */}
        <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* dots */}
        {showDots &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={strokeWidth + 1}
              fill="currentColor"
              opacity={i === points.length - 1 ? 1 : 0.6}
            />
          ))}
      </svg>
    );
  }
  