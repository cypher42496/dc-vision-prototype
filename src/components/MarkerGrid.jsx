import { useEffect, useRef, useState } from 'react'

// Marker IDs printed in MarkerPrintPage.jsx
const MARKER_TOP_ID = 0
const MARKER_BOTTOM_ID = 1

// Calibration: marker edge sits just outside the nutzbare HE-Bereich.
// Marker 1 (top) sits above HE N  → grid top  = center of marker 1 projected downward by half marker size
// Marker 2 (bottom) sits below HE 1 → grid bottom = center of marker 2 projected upward by half marker size
// For v1 we use the two marker centers directly as grid top/bottom anchors.
// The rack width is assumed to be ~8× the marker width (typical 19" rack with 5 cm marker).
const RACK_WIDTH_IN_MARKER_WIDTHS = 8

// Occupancy heuristic thresholds (conservative — avoid false positives).
//
// Three classes are returned by classifyOccupancy:
//   'belegt'   — high confidence: clearly bright AND clearly textured
//                (device fronts have screws, labels, LEDs → contrast)
//   'leer'     — high confidence: clearly dark AND flat (rack interior depth)
//   'unsicher' — anything in between. Treated as 'leer' in the comparison
//                (the safe default for an audit) but flagged with a yellow
//                ring in the AR overlay so the user knows to confirm manually.
const BELEGT_BRIGHTNESS_MIN = 75   // mean luma must be at least this to count as belegt
const BELEGT_STDDEV_MIN = 22       // stddev must be at least this (real device → texture)
const LEER_BRIGHTNESS_MAX = 55     // mean luma below this → strong "leer" signal
const LEER_STDDEV_MAX = 18         // and stddev below this → strong "leer" signal

function centerOfCorners(corners) {
  const x = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4
  const y = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4
  return { x, y }
}

function markerWidth(corners) {
  // average of top edge and bottom edge lengths
  const top = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y)
  const bot = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)
  return (top + bot) / 2
}

// Sample average brightness + stddev of a rectangle defined by two points
// (topLeft, bottomRight in image coordinates) on the given ImageData.
function sampleRegion(imageData, cx, cy, halfW, halfH) {
  const { data, width, height } = imageData
  const x0 = Math.max(0, Math.floor(cx - halfW))
  const x1 = Math.min(width - 1, Math.ceil(cx + halfW))
  const y0 = Math.max(0, Math.floor(cy - halfH))
  const y1 = Math.min(height - 1, Math.ceil(cy + halfH))
  if (x1 <= x0 || y1 <= y0) return { mean: 0, stddev: 0 }

  let sum = 0
  let sumSq = 0
  let count = 0
  // Subsample by stepping to keep this cheap (~300-500 pixels per region)
  const stepX = Math.max(1, Math.floor((x1 - x0) / 20))
  const stepY = Math.max(1, Math.floor((y1 - y0) / 8))
  for (let y = y0; y <= y1; y += stepY) {
    for (let x = x0; x <= x1; x += stepX) {
      const idx = (y * width + x) * 4
      // luma approximation
      const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114
      sum += lum
      sumSq += lum * lum
      count++
    }
  }
  if (count === 0) return { mean: 0, stddev: 0 }
  const mean = sum / count
  const variance = sumSq / count - mean * mean
  return { mean, stddev: Math.sqrt(Math.max(0, variance)) }
}

function classifyOccupancy(sample) {
  // High-confidence belegt: clearly bright AND clearly textured (device front)
  if (sample.mean >= BELEGT_BRIGHTNESS_MIN && sample.stddev >= BELEGT_STDDEV_MIN) {
    return 'belegt'
  }
  // High-confidence leer: clearly dark AND clearly flat (rack interior)
  if (sample.mean <= LEER_BRIGHTNESS_MAX && sample.stddev <= LEER_STDDEV_MAX) {
    return 'leer'
  }
  // Otherwise we don't trust the heuristic — flag for manual confirmation
  return 'unsicher'
}

export default function MarkerGrid({ rack, onComplete, onCancel }) {
  const totalUnits = rack.totalUnits
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const sampleCanvasRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)

  const [hasCamera, setHasCamera] = useState(false)
  const [status, setStatus] = useState('Kamera starten …')
  const [markersSeen, setMarkersSeen] = useState({ top: false, bottom: false })
  // istMap: { [he: number]: 'belegt' | 'leer' }
  const [istMap, setIstMap] = useState({})
  // userOverrides: keys = HE numbers the user has manually toggled
  const userOverridesRef = useRef({})
  const [, forceRerender] = useState(0)

  // Precompute soll-map
  const sollMap = {}
  rack.devices.forEach(device => {
    if (device.position > 0 && device.height > 0) {
      for (let i = 0; i < device.height; i++) {
        sollMap[device.position + i] = device
      }
    }
  })

  // Start camera
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

  // Init detector (once window.AR is available)
  useEffect(() => {
    if (!window.AR) return
    try {
      detectorRef.current = new window.AR.Detector({ dictionaryName: 'ARUCO_MIP_36h12' })
    } catch (err) {
      console.warn('Detector init failed:', err)
    }
  }, [])

  // Main detection + sampling loop
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

        // Resize canvases to match the video's natural resolution
        if (sampleCanvas.width !== vw || sampleCanvas.height !== vh) {
          sampleCanvas.width = vw
          sampleCanvas.height = vh
        }
        // Overlay canvas matches the video's DISPLAY size
        const displayW = video.clientWidth
        const displayH = video.clientHeight
        if (overlay.width !== displayW || overlay.height !== displayH) {
          overlay.width = displayW
          overlay.height = displayH
        }

        // Draw the current frame to the hidden sample canvas
        ctxSample.drawImage(video, 0, 0, vw, vh)
        let imageData
        try {
          imageData = ctxSample.getImageData(0, 0, vw, vh)
        } catch {
          // Cross-origin or other error — skip this frame
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        // Detect markers
        let markers = []
        if (detectorRef.current) {
          try {
            markers = detectorRef.current.detect(imageData)
          } catch (err) {
            // detection can throw on bad frames — ignore and retry next tick
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

        // Clear overlay each frame
        ctxOverlay.clearRect(0, 0, overlay.width, overlay.height)

        if (topMarker && bottomMarker) {
          const topC = centerOfCorners(topMarker.corners)
          const botC = centerOfCorners(bottomMarker.corners)
          const topW = markerWidth(topMarker.corners)
          const botW = markerWidth(bottomMarker.corners)
          const avgMarkerWidth = (topW + botW) / 2

          // Map image coords → overlay (display) coords
          const scaleX = overlay.width / vw
          const scaleY = overlay.height / vh

          // Vector from top marker center to bottom marker center (in image space)
          const dx = botC.x - topC.x
          const dy = botC.y - topC.y
          // Perpendicular unit vector (for left/right edges of each HE)
          const len = Math.hypot(dx, dy) || 1
          const perpX = -dy / len
          const perpY = dx / len

          const heHalfWidth = (avgMarkerWidth * RACK_WIDTH_IN_MARKER_WIDTHS) / 2

          // Sample each HE region on the image (not the overlay)
          const newIst = {}
          const quads = [] // for drawing

          for (let u = 1; u <= totalUnits; u++) {
            // HE u spans t=[u-1, u] / totalUnits between bottom→top marker
            // i.e. HE 1 closest to bottom marker, HE totalUnits closest to top marker
            const tTop = (u) / totalUnits        // 0..1 from bottom
            const tBot = (u - 1) / totalUnits

            const cxTop = botC.x + (topC.x - botC.x) * tTop
            const cyTop = botC.y + (topC.y - botC.y) * tTop
            const cxBot = botC.x + (topC.x - botC.x) * tBot
            const cyBot = botC.y + (topC.y - botC.y) * tBot

            const cx = (cxTop + cxBot) / 2
            const cy = (cyTop + cyBot) / 2

            // HE cell height (vertical span of one HE along the rack axis)
            const heLenOnImage = len / totalUnits
            const halfH = heLenOnImage * 0.45
            const halfW = heHalfWidth * 0.8 // sample a bit inside to avoid frame

            const sample = sampleRegion(imageData, cx, cy, halfW, halfH)
            newIst[u] = classifyOccupancy(sample)

            // Build the 4 corners of the HE quad on the overlay
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

          setIstMap(prev => {
            // merge with user overrides (which win)
            const merged = { ...newIst, ...userOverridesRef.current }
            // cheap shallow compare
            let same = true
            for (let u = 1; u <= totalUnits; u++) {
              if (merged[u] !== prev[u]) { same = false; break }
            }
            return same ? prev : merged
          })

          // Draw each HE quad with state color
          for (const q of quads) {
            const userOverride = userOverridesRef.current[q.u]
            const rawIst = newIst[q.u]                           // belegt | leer | unsicher
            const effectiveIst = userOverride ?? rawIst
            // For comparison purposes, "unsicher" counts as "leer" (conservative default)
            const istOccupied = effectiveIst === 'belegt'
            const isUnsure = !userOverride && rawIst === 'unsicher'
            const sollOccupied = !!sollMap[q.u]

            let fill, stroke
            if (sollOccupied && istOccupied) { fill = 'rgba(16,185,129,0.28)'; stroke = 'rgba(16,185,129,0.9)' }
            else if (sollOccupied && !istOccupied) { fill = 'rgba(239,68,68,0.28)'; stroke = 'rgba(239,68,68,0.9)' }
            else if (!sollOccupied && istOccupied) { fill = 'rgba(239,68,68,0.28)'; stroke = 'rgba(239,68,68,0.9)' }
            else { fill = 'rgba(100,116,139,0.12)'; stroke = 'rgba(148,163,184,0.5)' }

            // Unsicher cells get an extra yellow ring on top, regardless of soll/ist combo
            if (isUnsure) {
              stroke = 'rgba(251,191,36,0.95)' // amber-400
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

            // HE label
            const labelX = (q.tl.x + q.bl.x) / 2
            const labelY = (q.tl.y + q.bl.y) / 2
            ctxOverlay.fillStyle = 'white'
            ctxOverlay.font = 'bold 12px sans-serif'
            ctxOverlay.textAlign = 'center'
            ctxOverlay.textBaseline = 'middle'
            ctxOverlay.fillText(`HE ${q.u}`, labelX, labelY)
          }
        } else {
          // Show marker status
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

  // Manual toggle (tap an HE in the summary list to override)
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
      // Report each device only once (at its top unit)
      if (device) {
        if (seenDevices.has(device.id)) continue
        seenDevices.add(device.id)
        const sollOccupied = true
        // Device ist belegt only if all of its HEs are marked belegt
        let allBelegt = true
        for (let i = 0; i < device.height; i++) {
          if (istMap[device.position + i] !== 'belegt') { allBelegt = false; break }
        }
        const istOccupied = allBelegt
        const status = istOccupied ? 'correct' : 'missing'
        results.push({
          he: device.position,
          height: device.height,
          deviceName: device.name,
          soll: 'belegt',
          ist: istOccupied ? 'belegt' : 'leer',
          status,
        })
      } else {
        // No Soll device: if user/heuristic says belegt → unexpected
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
      // Don't count unsure HEs that the user has already manually decided on
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
      {/* Hidden sample canvas for marker detection + occupancy sampling */}
      <canvas ref={sampleCanvasRef} className="hidden" />

      {/* Camera video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${hasCamera ? '' : 'hidden'}`}
      />
      {/* Overlay canvas (perspective grid) */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Header */}
      <div className="relative z-10 bg-black/70 backdrop-blur-sm p-3 flex items-center justify-between shrink-0">
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

      {/* Status strip */}
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

      {/* Spacer so that content below sits above footer */}
      <div className="flex-1" />

      {/* Bottom collapsible device list (overrides) */}
      <div className="relative z-10 max-h-[40vh] overflow-auto bg-black/70 backdrop-blur-sm border-t border-gray-800">
        <div className="px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider">
          Erkennung (tippen zum Korrigieren)
        </div>
        <div className="px-3 pb-3 space-y-1">
          {Array.from({ length: totalUnits }, (_, i) => totalUnits - i).map(u => {
            const device = sollMap[u]
            // Only show top unit of multi-HE devices, plus empty HEs
            if (device && u !== device.position + device.height - 1) return null

            const sollOccupied = !!sollMap[u]
            // Effective ist for the representative HE (top unit for devices)
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
            // "unsicher" overrides the dot/label hint regardless of the soll/ist combo
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

      {/* Footer */}
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
