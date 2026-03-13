// Renders a route map by fetching OSM tiles directly onto a canvas.
// Does NOT depend on the Leaflet DOM — works independently of UI state.

function latLngToTileXY(lat: number, lng: number, z: number): [number, number] {
  const n = 2 ** z
  const x = Math.floor((lng + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return [x, y]
}

function latLngToPixel(
  lat: number, lng: number, z: number,
  tileX0: number, tileY0: number, tileSize: number
): { x: number; y: number } {
  const n = 2 ** z
  const x = (lng + 180) / 360 * n * tileSize - tileX0 * tileSize
  const latRad = lat * Math.PI / 180
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n * tileSize - tileY0 * tileSize
  return { x, y }
}

function chooseZoom(
  minLat: number, maxLat: number, minLng: number, maxLng: number,
  maxTiles: number
): number {
  for (let z = 10; z >= 1; z--) {
    const [x0, y0] = latLngToTileXY(maxLat, minLng, z)
    const [x1, y1] = latLngToTileXY(minLat, maxLng, z)
    if ((x1 - x0 + 1) * (y1 - y0 + 1) <= maxTiles) return z
  }
  return 1
}

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export interface RoutePoint { lat: number; lng: number }

export async function renderRouteMap(
  points: RoutePoint[],
  outputWidthPx = 768
): Promise<string | null> {
  if (points.length < 2) return null

  const TILE = 256
  const PAD_DEG = 0.3

  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const minLat = Math.min(...lats) - PAD_DEG
  const maxLat = Math.max(...lats) + PAD_DEG
  const minLng = Math.min(...lngs) - PAD_DEG * 1.5
  const maxLng = Math.max(...lngs) + PAD_DEG * 1.5

  const zoom = chooseZoom(minLat, maxLat, minLng, maxLng, 25)

  const [x0, y0] = latLngToTileXY(maxLat, minLng, zoom)
  const [x1, y1] = latLngToTileXY(minLat, maxLng, zoom)

  const cols = x1 - x0 + 1
  const rows = y1 - y0 + 1
  const canvasW = cols * TILE
  const canvasH = rows * TILE

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#e8ecef'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Fetch all tiles in parallel
  const subs = ['a', 'b', 'c']
  await Promise.all(
    Array.from({ length: cols }, (_, cx) =>
      Array.from({ length: rows }, (_, cy) => {
        const tx = x0 + cx
        const ty = y0 + cy
        const sub = subs[(tx + ty) % 3]
        const url = `https://${sub}.tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`
        return loadImg(url)
          .then(img => ctx.drawImage(img, cx * TILE, cy * TILE))
          .catch(() => {/* leave gray */})
      })
    ).flat()
  )

  // Route polyline
  const toPixel = (p: RoutePoint) => latLngToPixel(p.lat, p.lng, zoom, x0, y0, TILE)

  ctx.strokeStyle = '#f97316'
  ctx.lineWidth = Math.max(3, canvasW / 150)
  ctx.setLineDash([canvasW / 50, canvasW / 80])
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  points.forEach((p, i) => {
    const { x, y } = toPixel(p)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.setLineDash([])

  // Markers
  const r = Math.max(8, canvasW / 60)
  points.forEach((p, i) => {
    const { x, y } = toPixel(p)
    const isFirst = i === 0
    const isLast = i === points.length - 1
    ctx.beginPath()
    ctx.arc(x, y, isFirst || isLast ? r : r * 0.65, 0, Math.PI * 2)
    ctx.fillStyle = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#f97316'
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = Math.max(2, r * 0.3)
    ctx.stroke()
  })

  // Scale down to target width
  const scale = outputWidthPx / canvasW
  const out = document.createElement('canvas')
  out.width = outputWidthPx
  out.height = Math.round(canvasH * scale)
  const octx = out.getContext('2d')!
  octx.drawImage(canvas, 0, 0, out.width, out.height)

  return out.toDataURL('image/jpeg', 0.88)
}
