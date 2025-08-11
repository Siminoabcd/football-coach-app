import * as React from "react";

type XY = { x: number; y: number };

type Props =
  | { data: XY[]; values?: never; width?: number; height?: number; strokeWidth?: number; className?: string; showDots?: boolean }
  | { values: number[]; data?: never; width?: number; height?: number; strokeWidth?: number; className?: string; showDots?: boolean };

/**
 * Tiny sparkline that accepts EITHER:
 *   <Sparkline data={[{x,y}, ...]} />
 * OR
 *   <Sparkline values={[1,2,3]} />
 */
export default function Sparkline(props: Props) {
  const width = props.width ?? 240;
  const height = props.height ?? 48;
  const strokeWidth = props.strokeWidth ?? 2;
  const pad = 2;

  const ys: number[] =
    "data" in props
      ? (props.data ?? []).map(d => Number(d.y ?? 0))
      : (props.values ?? []).map(v => Number(v ?? 0));

  const n = ys.length;
  if (!n) {
    return (
      <svg width={width} height={height} className={props.className}>
        <rect x="0" y="0" width={width} height={height} fill="none" />
      </svg>
    );
  }

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = maxY - minY || 1;

  const stepX = (width - pad * 2) / Math.max(n - 1, 1);

  const points = ys.map((y, i) => {
    const x = pad + i * stepX;
    const yy = pad + (height - pad * 2) * (1 - (y - minY) / yRange);
    return [x, yy] as const;
  });

  const d =
    "M " +
    points
      .map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" L ");

  return (
    <svg width={width} height={height} className={props.className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      {"showDots" in props && props.showDots
        ? points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={strokeWidth} fill="currentColor" />
          ))
        : null}
    </svg>
  );
}
