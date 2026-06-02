const DELTA = 0.03

export function buildOsmEmbedUrl(lat: number, lon: number): string {
  const bbox = `${lon - DELTA},${lat - DELTA},${lon + DELTA},${lat + DELTA}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
}

export function buildOsmLinkUrl(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`
}
