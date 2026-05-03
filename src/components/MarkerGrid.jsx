import { useEffect, useRef, useState } from 'react'

const MARKER_TOP_ID = 0
const MARKER_BOTTOM_ID = 1

const RACK_WIDTH_IN_MARKER_WIDTHS = 8

const BELEGT_BRIGHTNESS_MIN = 75
const BELEGT_STDDEV_MIN = 22
const LEER_BRIGHTNESS_MAX = 55
const LEER_STDDEV_MAX = 18

const SAMPLE_HISTORY_SIZE = 8

function centerOfCorners(corners) {
  const x = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4
  const y = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4
  return { x, y }
}

function markerWidth(corners) {
  const top = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y)
  const bot = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)
  return (top + bot) / 2
}

const EDGE_GRADIENT_THRESHOLD = 28

function sampleRegion(imageData, cx, cy, halfW, halfH) {
  const { data, width, height } = imageData
  const x0 = Math.max(1, Math.floor(cx - halfW))
  const x1 = Math.min(width - 2, Math.ceil(cx + halfW))
  const y0 = Math.max(1, Math.floor(cy - halfH))
  const y1 = Math.min(height - 2, Math.ceil(cy + halfH))
  if (x1 <= x0 || y1 <= y0) return { mean: 0, stddev: 0, edgeDensity: 0 }

  let sum = 0
  let sumSq = 0
  let count = 0
  let edgeCount = 0
  const stepX = Math.max(1, Math.floor((x1 - x0) / 20))
  const stepY = Math.max(1, Math.floor((y1 - y0) / 8))

  const luma = (x, y) => {
    const idx = (y * width + x) * 4
    return data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114
  }

  for (let y = y0; y <= y1; y += stepY) {
    for (let x = x0; x <= x1; x += stepX) {
      const lum = luma(x, y)
      sum += lum
      sumSq += lum * lum
      count++

      const gx = Math.abs(luma(x + 1, y) - luma(x - 1, y))
      const gy = Math.abs(luma(x, y + 1) - luma(x, y - 1))
      if (gx + gy >= EDGE_GRADIENT_THRESHOLD) edgeCount++
    }
  }
  if (count === 0) return { mean: 0, stddev: 0, edgeDensity: 0 }
  const mean = sum / count
  const variance = sumSq / count - mean * mean
  return {
    mean,
    stddev: Math.sqrt(Math.max(0, variance)),
    edgeDensity: edgeCount / count,
  }
}

const BELEGT_EDGE_MIN = 0.08
const LEER_EDGE_MAX = 0.03

function classifyOccupancy(sample) {
  const brightOk = sample.mean >= BELEGT_BRIGHTNESS_MIN
  const textureOk = sample.stddev >= BELEGT_STDDEV_MIN
  const edgeOk = sample.edgeDensity >= BELEGT_EDGE_MIN
  const belegtVotes = (brightOk ? 1 : 0) + (textureOk ? 1 : 0) + (edgeOk ? 1 : 0)
  if (belegtVotes >= 2) return 'belegt'

  if (
    sample.mean <= LEER_BRIGHTNESS_MAX &&
    sample.stddev <= LEER_STDDEV_MAX &&
    sample.edgeDensity <= LEER_EDGE_MAX
  ) {
    return 'leer'
  }
  return 'unsicher'
}

function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const ADAPTIVE_BRIGHT_MARGIN = 12
const ADAPTIVE_TEXTURE_MARGIN = 5
const ADAPTIVE_EDGE_MARGIN = 0.03

function classifyAdaptive(sample, sceneMedianMean, sceneMedianStd, sceneMedianEdge) {
  const brightDelta = sample.mean - sceneMedianMean
  const textureDelta = sample.stddev - sceneMedianStd
  const edgeDelta = sample.edgeDensity - sceneMedianEdge

  const brightHigh = brightDelta >= ADAPTIVE_BRIGHT_MARGIN
  const textureHigh = textureDelta >= ADAPTIVE_TEXTURE_MARGIN
  const edgeHigh = edgeDelta >= ADAPTIVE_EDGE_MARGIN
  const brightLow = brightDelta <= -ADAPTIVE_BRIGHT_MARGIN
  const textureLow = textureDelta <= -ADAPTIVE_TEXTURE_MARGIN
  const edgeLow = edgeDelta <= -ADAPTIVE_EDGE_MARGIN

  const highVotes = (brightHigh ? 1 : 0) + (textureHigh ? 1 : 0) + (edgeHigh ? 1 : 0)
  if (highVotes >= 2) return 'belegt'

  const lowVotes = (brightLow ? 1 : 0) + (textureLow ? 1 : 0) + (edgeLow ? 1 : 0)
  if (lowVotes >= 2) return 'leer'

  return classifyOccupancy(sample)
}

function voteSubZones(zoneLabels) {
  const tally = { belegt: 0, leer: 0, unsicher: 0 }
  for (const l of zoneLabels) tally[l] = (tally[l] || 0) + 1

  if (tally.belegt >= 2) return 'belegt'
  if (tally.leer >= 2) return 'leer'
  return 'unsicher'
}

const AR_VIEW_MODES = [
  { id: 'normal', label: 'Abgleich' },
  { id: 'manual', label: 'Manuell' },
  { id: 'security', label: '🔒 Sicherheit' },
  { id: 'environment', label: '🌿 Umwelt' },
  { id: 'network', label: '🔌 Netzwerk' },
]

export default function MarkerGrid({ rack, onComplete, onCancel, onSwitchMode }) {
  const totalUnits = rack.totalUnits
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const sampleCanvasRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)

  const [hasCamera, setHasCamera] = useState(false)
  const [status, setStatus] = useState('Kamera starten …')
  const [markersSeen, setMarkersSeen] = useState({ top: false, bottom: false })
  const [istMap, setIstMap] = useState({})
  const istMapRef = useRef({})
  const userOverridesRef = useRef({})
  const sampleHistoryRef = useRef({})
  const [, forceRerender] = useState(0)
  const [arViewMode, setArViewMode] = useState('normal')
  const arViewModeRef = useRef('normal')

  useEffect(() => { istMapRef.current = istMap }, [istMap])

  const networkConnectionsRef = useRef([])
  useEffect(() => {
    const isHealthy = (d) =>
      d.status === 'produktiv' && d.plannedStatus === 'produktiv' && !d.plannedModel
    const result = []
    const seen = new Set()
    rack.devices.forEach(dev => {
      ;(dev.ports ?? []).forEach(port => {
        if (!port.connectedTo) return
        const target = rack.devices.find(d =>
          (d.ports ?? []).some(p => p.id === port.connectedTo)
        )
        if (!target || target.id === dev.id) return
        const key = [dev.id, target.id].sort().join('|')
        if (seen.has(key)) return
        seen.add(key)
        result.push({
          fromPos: dev.position,
          fromHeight: dev.height,
          toPos: target.position,
          toHeight: target.height,
          fromHealthy: isHealthy(dev),
          toHealthy: isHealthy(target),
        })
      })
    })
    networkConnectionsRef.current = result
  }, [rack])

  const handleSetArViewMode = (m) => {
    if (m === 'manual') {
      onSwitchMode?.()
      return
    }
    setArViewMode(m)
    arViewModeRef.current = m
  }

  const sollMap = {}
  rack.devices.forEach(device => {
    if (device.position > 0 && device.height > 0) {
      for (let i = 0; i < device.height; i++) {
        sollMap[device.position + i] = device
      }
    }
  })

  useEffect(() => {
    let stream = null
    let cancelled = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('Kamera nicht verfügbar')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
          setHasCamera(true)
          setStatus('Marker werden gesucht …')
        }
      } catch (err) {
        console.warn('Camera error:', err)
        setStatus('Kamera-Zugriff verweigert')
      }
    }
    start()
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!window.AR) return
    try {
      detectorRef.current = new window.AR.Detector({ dictionaryName: 'ARUCO_MIP_36h12' })
    } catch (err) {
      console.warn('Detector init failed:', err)
    }
  }, [])

  useEffect(() => {
    if (!hasCamera) return
    const video = videoRef.current
    const overlay = overlayRef.current
    const sampleCanvas = sampleCanvasRef.current
    if (!video || !overlay || !sampleCanvas) return

    const ctxOverlay = overlay.getContext('2d')
    const ctxSample = sampleCanvas.getContext('2d', { willReadFrequently: true })

    const loop = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        const vw = video.videoWidth
        const vh = video.videoHeight

        if (sampleCanvas.width !== vw || sampleCanvas.height !== vh) {
          sampleCanvas.width = vw
          sampleCanvas.height = vh
        }
        const displayW = video.clientWidth
        const displayH = video.clientHeight
        if (overlay.width !== displayW || overlay.height !== displayH) {
          overlay.width = displayW
          overlay.height = displayH
        }

        ctxSample.drawImage(video, 0, 0, vw, vh)
        let imageData
        try {
          imageData = ctxSample.getImageData(0, 0, vw, vh)
        } catch {
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        let markers = []
        if (detectorRef.current) {
          try {
            markers = detectorRef.current.detect(imageData)
          } catch (err) {
            markers = []
          }
        }

        const topMarker = markers.find(m => m.id === MARKER_TOP_ID)
        const bottomMarker = markers.find(m => m.id === MARKER_BOTTOM_ID)

        setMarkersSeen(prev => {
          const next = { top: !!topMarker, bottom: !!bottomMarker }
          if (next.top === prev.top && next.bottom === prev.bottom) return prev
          return next
        })

        ctxOverlay.clearRect(0, 0, overlay.width, overlay.height)

        if (!topMarker || !bottomMarker) {
          sampleHistoryRef.current = {}
        }

        if (topMarker && bottomMarker) {
          const topC = centerOfCorners(topMarker.corners)
          const botC = centerOfCorners(bottomMarker.corners)
          const topW = markerWidth(topMarker.corners)
          const botW = markerWidth(bottomMarker.corners)
          const avgMarkerWidth = (topW + botW) / 2

          const scaleX = overlay.width / vw
          const scaleY = overlay.height / vh

          const dx = botC.x - topC.x
          const dy = botC.y - topC.y
          const len = Math.hypot(dx, dy) || 1
          const perpX = -dy / len
          const perpY = dx / len

          const heHalfWidth = (avgMarkerWidth * RACK_WIDTH_IN_MARKER_WIDTHS) / 2

          const newIst = {}
          const quads = []
          const smoothedSamples = {}

          const ZONE_OFFSETS = [-0.55, 0, 0.55]

          for (let u = 1; u <= totalUnits; u++) {
            const tTop = (u) / totalUnits
            const tBot = (u - 1) / totalUnits

            const cxTop = botC.x + (topC.x - botC.x) * tTop
            const cyTop = botC.y + (topC.y - botC.y) * tTop
            const cxBot = botC.x + (topC.x - botC.x) * tBot
            const cyBot = botC.y + (topC.y - botC.y) * tBot

            const cx = (cxTop + cxBot) / 2
            const cy = (cyTop + cyBot) / 2

            const heLenOnImage = len / totalUnits
            const zoneHalfH = heLenOnImage * 0.11
            const halfW = heHalfWidth * 0.60

            const axisX = (topC.x - botC.x) / len
            const axisY = (topC.y - botC.y) / len

            const zoneSmoothed = []
            for (let z = 0; z < 3; z++) {
              const offset = ZONE_OFFSETS[z] * (heLenOnImage / 2)
              const zcx = cx + axisX * offset
              const zcy = cy + axisY * offset

              const rawSample = sampleRegion(imageData, zcx, zcy, halfW, zoneHalfH)

              const key = `${u}_${z}`
              const history = sampleHistoryRef.current[key] ?? []
              history.push(rawSample)
              if (history.length > SAMPLE_HISTORY_SIZE) history.shift()
              sampleHistoryRef.current[key] = history

              let sumMean = 0, sumStd = 0, sumEdge = 0
              for (const s of history) {
                sumMean += s.mean
                sumStd += s.stddev
                sumEdge += s.edgeDensity
              }
              zoneSmoothed.push({
                mean: sumMean / history.length,
                stddev: sumStd / history.length,
                edgeDensity: sumEdge / history.length,
              })
            }
            smoothedSamples[u] = zoneSmoothed

            const tl = {
              x: (cxTop + perpX * heHalfWidth) * scaleX,
              y: (cyTop + perpY * heHalfWidth) * scaleY,
            }
            const tr = {
              x: (cxTop - perpX * heHalfWidth) * scaleX,
              y: (cyTop - perpY * heHalfWidth) * scaleY,
            }
            const br = {
              x: (cxBot - perpX * heHalfWidth) * scaleX,
              y: (cyBot - perpY * heHalfWidth) * scaleY,
            }
            const bl = {
              x: (cxBot + perpX * heHalfWidth) * scaleX,
              y: (cyBot + perpY * heHalfWidth) * scaleY,
            }
            quads.push({ u, tl, tr, br, bl })
          }

          const allMeans = []
          const allStds = []
          const allEdges = []
          for (let u = 1; u <= totalUnits; u++) {
            const centerZone = smoothedSamples[u][1]
            allMeans.push(centerZone.mean)
            allStds.push(centerZone.stddev)
            allEdges.push(centerZone.edgeDensity)
          }
          const sceneMedianMean = median(allMeans)
          const sceneMedianStd = median(allStds)
          const sceneMedianEdge = median(allEdges)

          for (let u = 1; u <= totalUnits; u++) {
            const zoneLabels = smoothedSamples[u].map(sample =>
              classifyAdaptive(
                sample,
                sceneMedianMean,
                sceneMedianStd,
                sceneMedianEdge
              )
            )
            newIst[u] = voteSubZones(zoneLabels)
          }

          setIstMap(prev => {
            const merged = { ...newIst, ...userOverridesRef.current }
            let same = true
            for (let u = 1; u <= totalUnits; u++) {
              if (merged[u] !== prev[u]) { same = false; break }
            }
            return same ? prev : merged
          })

          const isDeviceDetected = (pos, height) => {
            for (let i = 0; i < height; i++) {
              if (istMapRef.current[pos + i] === 'leer') return false
            }
            return true
          }

          const currentMode = arViewModeRef.current
          for (const q of quads) {
            const userOverride = userOverridesRef.current[q.u]
            const rawIst = newIst[q.u]
            const effectiveIst = userOverride ?? rawIst
            const istOccupied = effectiveIst === 'belegt'
            const isUnsure = !userOverride && rawIst === 'unsicher'
            const sollOccupied = !!sollMap[q.u]
            const device = sollMap[q.u]

            let fill, stroke

            if (currentMode === 'security' || currentMode === 'environment' || currentMode === 'network') {
              let hasInfo = false
              if (currentMode === 'security') hasInfo = !!(device && device.securityInfo)
              else if (currentMode === 'environment') hasInfo = !!(device && device.environmentInfo)
              else if (currentMode === 'network') hasInfo = !!(device && device.ports && device.ports.length > 0)

              const networkProblem = currentMode === 'network' && hasInfo &&
                !isDeviceDetected(device.position, device.height)

              if (networkProblem) {
                fill = 'rgba(251,146,60,0.35)'; stroke = 'rgba(251,146,60,0.95)'
              } else if (hasInfo) {
                fill = 'rgba(59,130,246,0.35)'; stroke = 'rgba(59,130,246,0.95)'
              } else if (device) {
                fill = 'rgba(100,116,139,0.15)'; stroke = 'rgba(148,163,184,0.5)'
              } else {
                fill = 'rgba(100,116,139,0.05)'; stroke = 'rgba(148,163,184,0.25)'
              }
            } else {
              if (sollOccupied && istOccupied) { fill = 'rgba(16,185,129,0.28)'; stroke = 'rgba(16,185,129,0.9)' }
              else if (sollOccupied && !istOccupied) { fill = 'rgba(239,68,68,0.28)'; stroke = 'rgba(239,68,68,0.9)' }
              else if (!sollOccupied && istOccupied) { fill = 'rgba(239,68,68,0.28)'; stroke = 'rgba(239,68,68,0.9)' }
              else { fill = 'rgba(100,116,139,0.12)'; stroke = 'rgba(148,163,184,0.5)' }

              if (isUnsure) {
                stroke = 'rgba(251,191,36,0.95)'
              }
            }

            ctxOverlay.beginPath()
            ctxOverlay.moveTo(q.tl.x, q.tl.y)
            ctxOverlay.lineTo(q.tr.x, q.tr.y)
            ctxOverlay.lineTo(q.br.x, q.br.y)
            ctxOverlay.lineTo(q.bl.x, q.bl.y)
            ctxOverlay.closePath()
            ctxOverlay.fillStyle = fill
            ctxOverlay.fill()
            ctxOverlay.lineWidth = 2
            ctxOverlay.strokeStyle = stroke
            ctxOverlay.stroke()

            const labelX = (q.tl.x + q.bl.x) / 2
            const labelY = (q.tl.y + q.bl.y) / 2
            ctxOverlay.fillStyle = 'white'
            ctxOverlay.font = 'bold 12px sans-serif'
            ctxOverlay.textAlign = 'center'
            ctxOverlay.textBaseline = 'middle'
            ctxOverlay.fillText(`HE ${q.u}`, labelX, labelY)
          }

          if (currentMode === 'network') {
            const cons = networkConnectionsRef.current
            cons.forEach((c, i) => {
              const fromCenterHE = c.fromPos + Math.floor(c.fromHeight / 2)
              const toCenterHE   = c.toPos   + Math.floor(c.toHeight   / 2)
              const fromQ = quads.find(q => q.u === fromCenterHE)
              const toQ   = quads.find(q => q.u === toCenterHE)
              if (!fromQ || !toQ) return

              const ax1 = (fromQ.tr.x + fromQ.br.x) / 2
              const ay1 = (fromQ.tr.y + fromQ.br.y) / 2
              const ax2 = (toQ.tr.x   + toQ.br.x)   / 2
              const ay2 = (toQ.tr.y   + toQ.br.y)   / 2

              const ok = c.fromHealthy && c.toHealthy &&
                         isDeviceDetected(c.fromPos, c.fromHeight) &&
                         isDeviceDetected(c.toPos,   c.toHeight)

              const bulge = 55 + i * 18
              const color = ok ? 'rgba(96,165,250,0.95)' : 'rgba(251,146,60,0.95)'

              ctxOverlay.save()
              ctxOverlay.lineWidth = 2.5
              ctxOverlay.strokeStyle = color
              ctxOverlay.lineJoin = 'round'
              ctxOverlay.lineCap  = 'round'
              if (!ok) ctxOverlay.setLineDash([6, 4])
              ctxOverlay.beginPath()
              ctxOverlay.moveTo(ax1, ay1)
              ctxOverlay.bezierCurveTo(ax1 + bulge, ay1, ax1 + bulge, ay2, ax2, ay2)
              ctxOverlay.stroke()
              ctxOverlay.setLineDash([])

              ctxOverlay.fillStyle = color
              ctxOverlay.beginPath()
              ctxOverlay.arc(ax1, ay1, 4, 0, Math.PI * 2)
              ctxOverlay.fill()
              ctxOverlay.beginPath()
              ctxOverlay.arc(ax2, ay2, 4, 0, Math.PI * 2)
              ctxOverlay.fill()
              ctxOverlay.restore()
            })
          }
        } else {
          ctxOverlay.fillStyle = 'rgba(0,0,0,0.55)'
          ctxOverlay.fillRect(0, overlay.height - 90, overlay.width, 90)
          ctxOverlay.fillStyle = 'white'
          ctxOverlay.font = 'bold 14px sans-serif'
          ctxOverlay.textAlign = 'center'
          ctxOverlay.fillText(
            topMarker ? '✓ Marker oben erkannt' : '✗ Marker oben fehlt',
            overlay.width / 2,
            overlay.height - 55,
          )
          ctxOverlay.fillText(
            bottomMarker ? '✓ Marker unten erkannt' : '✗ Marker unten fehlt',
            overlay.width / 2,
            overlay.height - 30,
          )
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [hasCamera, totalUnits])

  const toggleOverride = (he) => {
    const current = userOverridesRef.current[he] ?? istMap[he]
    const next = current === 'belegt' ? 'leer' : 'belegt'
    userOverridesRef.current = { ...userOverridesRef.current, [he]: next }
    setIstMap(prev => ({ ...prev, [he]: next }))
    forceRerender(n => n + 1)
  }

  const handleComplete = () => {
    const results = []
    const seenDevices = new Set()
    for (let u = 1; u <= totalUnits; u++) {
      const device = sollMap[u]
      if (device) {
        if (seenDevices.has(device.id)) continue
        seenDevices.add(device.id)
        let allBelegt = true
        for (let i = 0; i < device.height; i++) {
          if (istMap[device.position + i] !== 'belegt') { allBelegt = false; break }
        }
        const istOccupied = allBelegt
        const isBlindpanel = device.type === 'blindpanel'
        let status
        if (istOccupied) status = 'correct'
        else if (isBlindpanel) status = 'blindpanel_unconfirmed'
        else status = 'missing'
        results.push({
          he: device.position,
          height: device.height,
          deviceName: device.name,
          deviceType: device.type,
          soll: 'belegt',
          ist: istOccupied ? 'belegt' : 'leer',
          status,
        })
      } else {
        if (istMap[u] === 'belegt') {
          results.push({
            he: u,
            height: 1,
            deviceName: null,
            soll: 'leer',
            ist: 'belegt',
            status: 'unexpected',
          })
        }
      }
    }
    onComplete(results)
  }

  const totalMarkedBelegt = Object.values(istMap).filter(v => v === 'belegt').length
  const unsureCount = (() => {
    let count = 0
    for (let u = 1; u <= totalUnits; u++) {
      if (userOverridesRef.current[u] !== undefined) continue
      if (istMap[u] === 'unsicher') count++
    }
    return count
  })()
  const deviationsCount = (() => {
    let count = 0
    for (let u = 1; u <= totalUnits; u++) {
      const sollOccupied = !!sollMap[u]
      const istOccupied = istMap[u] === 'belegt'
      if (sollOccupied !== istOccupied) count++
    }
    return count
  })()

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${hasCamera ? '' : 'bg-gray-900'}`}>
      <canvas ref={sampleCanvasRef} className="hidden" />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${hasCamera ? '' : 'hidden'}`}
      />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 bg-black/70 backdrop-blur-sm p-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{rack.name} – AR-Abgleich</h2>
            <p className="text-xs text-gray-300 truncate">{rack.location}</p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-800/80 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors shrink-0"
          >
            Abbrechen
          </button>
        </div>
        <div className="flex gap-1 bg-black/40 rounded-lg p-0.5 overflow-x-auto max-w-full scrollbar-hide">
          {AR_VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleSetArViewMode(mode.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                arViewMode === mode.id
                  ? mode.id === 'normal'
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : 'bg-blue-500/30 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 bg-black/50 backdrop-blur-sm px-3 py-2 text-xs text-white flex gap-4 shrink-0">
        {!hasCamera && <span className="text-amber-300">{status}</span>}
        {hasCamera && (
          <>
            <span className={markersSeen.top ? 'text-emerald-400' : 'text-red-400'}>
              {markersSeen.top ? '● Marker oben' : '○ Marker oben'}
            </span>
            <span className={markersSeen.bottom ? 'text-emerald-400' : 'text-red-400'}>
              {markersSeen.bottom ? '● Marker unten' : '○ Marker unten'}
            </span>
            {markersSeen.top && markersSeen.bottom && (
              <>
                <span className="text-gray-300">
                  {deviationsCount} Abweichung{deviationsCount === 1 ? '' : 'en'}
                </span>
                {unsureCount > 0 && (
                  <span className="text-amber-400">
                    {unsureCount} unsicher
                  </span>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="flex-1" />

      <div className="relative z-10 max-h-[40vh] overflow-auto bg-black/70 backdrop-blur-sm border-t border-gray-800">
        <div className="px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider">
          {arViewMode === 'normal'
            ? 'Erkennung (tippen zum Korrigieren)'
            : arViewMode === 'network'
              ? 'Netzwerk-Ports & Verbindungen'
              : arViewMode === 'security'
                ? 'Sicherheitsrelevante Informationen'
                : 'Umweltrelevante Informationen'}
        </div>
        <div className="px-3 pb-3 space-y-1">
          {Array.from({ length: totalUnits }, (_, i) => totalUnits - i).map(u => {
            const device = sollMap[u]
            if (device && u !== device.position + device.height - 1) return null

            if (arViewMode !== 'normal') {
              if (!device) return null

              let hasInfo, infoContent
              if (arViewMode === 'network') {
                const ports = device.ports ?? []
                hasInfo = ports.length > 0
                const connected = ports.filter(p => p.connectedTo).length
                infoContent = hasInfo
                  ? `${ports.length} Port${ports.length !== 1 ? 's' : ''}, ${connected} verbunden — ${ports.slice(0, 3).map(p => `${p.name} (${p.type})`).join(', ')}${ports.length > 3 ? ' …' : ''}`
                  : null
              } else {
                const infoField = arViewMode === 'security' ? 'securityInfo' : 'environmentInfo'
                hasInfo = !!device[infoField]
                infoContent = hasInfo ? device[infoField] : null
              }

              return (
                <div
                  key={u}
                  className="w-full flex items-start gap-2 px-2 py-1.5 rounded"
                >
                  <span className="text-[10px] text-gray-500 font-mono w-6 text-right shrink-0 pt-0.5">{u}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${hasInfo ? 'bg-blue-500' : 'bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 truncate">{device.name}</div>
                    {infoContent ? (
                      <div className="text-[10px] text-blue-300 mt-0.5 line-clamp-2">{infoContent}</div>
                    ) : (
                      <div className="text-[10px] text-gray-600 mt-0.5 italic">
                        {arViewMode === 'network' ? 'Keine Ports' : 'Keine Info hinterlegt'}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            const sollOccupied = !!sollMap[u]
            const effectiveHe = device ? device.position : u
            const rawValue = istMap[effectiveHe]
            const userOverride = userOverridesRef.current[effectiveHe]
            const hasOverride = userOverride !== undefined
            const istOccupied = rawValue === 'belegt'
            const isUnsure = !hasOverride && rawValue === 'unsicher'

            let dot = 'bg-gray-600'
            let label = 'leer'
            let labelColor = 'text-gray-500'
            if (sollOccupied && istOccupied) {
              dot = 'bg-emerald-500'
              label = 'erkannt ✓'
              labelColor = 'text-emerald-400'
            } else if (sollOccupied && !istOccupied) {
              dot = 'bg-red-500'
              label = 'fehlt'
              labelColor = 'text-red-400'
            } else if (!sollOccupied && istOccupied) {
              dot = 'bg-red-500'
              label = 'unerwartet'
              labelColor = 'text-red-400'
            }
            if (isUnsure) {
              dot = 'bg-amber-400'
              label = sollOccupied ? 'unsicher – bitte prüfen' : 'unsicher'
              labelColor = 'text-amber-400'
            }

            return (
              <button
                key={u}
                onClick={() => toggleOverride(effectiveHe)}
                className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded hover:bg-white/5"
              >
                <span className="text-[10px] text-gray-500 font-mono w-6 text-right">{u}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <span className="text-xs text-gray-200 flex-1 truncate">
                  {device ? device.name : <span className="text-gray-500 italic">Leer</span>}
                </span>
                <span className={`text-[10px] ${labelColor}`}>
                  {label}{hasOverride ? ' ✎' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative z-10 bg-black/80 backdrop-blur-sm p-3 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-300">
          {totalMarkedBelegt} belegt / {totalUnits} HE
        </div>
        <button
          onClick={handleComplete}
          disabled={!markersSeen.top || !markersSeen.bottom}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Abgleich abschließen
        </button>
      </div>
    </div>
  )
}
