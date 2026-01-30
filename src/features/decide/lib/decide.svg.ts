function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return {
    x: Number((cx + r * Math.cos(rad)).toFixed(6)),
    y: Number((cy + r * Math.sin(rad)).toFixed(6)),
  }
}

export function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end = polarToCartesian(cx, cy, r, endDeg)

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 0 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}
