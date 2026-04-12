import { useState, useRef, useEffect } from 'react'

const HE_VIEW_MODES = [
  { id: 'normal', label: 'Abgleich' },
  { id: 'manual', label: 'Manuell' },
]

export default function HEGrid({ rack, onComplete, onCancel, onSwitchMode }) {
  const totalUnits = rack.totalUnits
  const videoRef = useRef(null)
  const [hasCamera, setHasCamera] = useState(false)

  // Track which HEs the user marked as "belegt"
  const [markedUnits, setMarkedUnits] = useState(new Set())

  // Build soll map: which HEs should be occupied
  const sollMap = {}
  rack.devices.forEach(device => {
    if (device.position > 0 && device.height > 0) {
      for (let i = 0; i < device.height; i++) {
        sollMap[device.position + i] = device
      }
    }
  })

  // Start camera feed as background
  useEffect(() => {
    let stream = null
    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasCamera(true)
        }
      } catch {
        // Camera may not be available, continue without
      }
    }
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Toggle a HE unit. If it belongs to a device, toggle all HEs of that device.
  const toggleUnit = (unitNumber) => {
    const device = sollMap[unitNumber]
    const unitsToToggle = []

    if (device) {
      // Toggle all HEs belonging to this device
      for (let i = 0; i < device.height; i++) {
        unitsToToggle.push(device.position + i)
      }
    } else {
      unitsToToggle.push(unitNumber)
    }

    setMarkedUnits(prev => {
      const next = new Set(prev)
      const isCurrentlyMarked = next.has(unitNumber)
      unitsToToggle.forEach(u => {
        if (isCurrentlyMarked) {
          next.delete(u)
        } else {
          next.add(u)
        }
      })
      return next
    })
  }

  // Determine color for each HE
  const getHEColor = (unitNumber) => {
    const sollOccupied = !!sollMap[unitNumber]
    const istOccupied = markedUnits.has(unitNumber)

    if (sollOccupied && istOccupied) return 'bg-emerald-500/50 border-emerald-400' // correct
    if (sollOccupied && !istOccupied) return 'bg-gray-500/20 border-gray-600'       // not yet marked
    if (!sollOccupied && istOccupied) return 'bg-red-500/50 border-red-400'          // unexpected
    return 'bg-gray-900/20 border-gray-700/30'                                       // empty, correct
  }

  // After user starts marking, show live deviations
  const getHEStatus = (unitNumber) => {
    const sollOccupied = !!sollMap[unitNumber]
    const istOccupied = markedUnits.has(unitNumber)
    const device = sollMap[unitNumber]

    if (sollOccupied && istOccupied) return { label: device.name, status: 'correct' }
    if (sollOccupied && !istOccupied) return { label: device.name, status: 'pending' }
    if (!sollOccupied && istOccupied) return { label: 'Unerwartet', status: 'unexpected' }
    return { label: '', status: 'empty' }
  }

  const handleComplete = () => {
    const results = []
    for (let u = 1; u <= totalUnits; u++) {
      const sollOccupied = !!sollMap[u]
      const istOccupied = markedUnits.has(u)
      const device = sollMap[u]

      // Only report top unit of each device
      if (device && u !== device.position) continue

      if (sollOccupied || istOccupied) {
        let status
        if (sollOccupied && istOccupied) status = 'correct'
        else if (sollOccupied && !istOccupied) status = 'missing'
        else status = 'unexpected'

        results.push({
          he: u,
          height: device?.height || 1,
          deviceName: device?.name || null,
          soll: sollOccupied ? 'belegt' : 'leer',
          ist: istOccupied ? 'belegt' : 'leer',
          status,
        })
      }
    }
    onComplete(results)
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${hasCamera ? '' : 'bg-gray-900'}`}>
      {/* Camera background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${hasCamera ? '' : 'hidden'}`}
      />
      {/* Dark overlay for readability (only when camera is active) */}
      {hasCamera && <div className="absolute inset-0 bg-black/40" />}

      {/* Header */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm p-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{rack.name} – Manueller Abgleich</h2>
            <p className="text-xs text-gray-300">{rack.location}</p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-800/80 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
        {/* View mode toggle */}
        {onSwitchMode && (
          <div className="flex gap-1 bg-black/40 rounded-lg p-0.5 w-fit">
            {HE_VIEW_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  if (mode.id !== 'manual') onSwitchMode()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mode.id === 'manual'
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HE Grid */}
      <div className="relative z-10 flex-1 overflow-auto px-3 py-2">
        <div className="max-w-md mx-auto flex flex-col gap-[1px]">
          {Array.from({ length: totalUnits }, (_, i) => totalUnits - i).map(u => {
            const device = sollMap[u]
            // Skip if this HE is part of a device but not the top unit
            if (device && u !== device.position + device.height - 1) return null

            const height = device ? device.height : 1
            const heStatus = getHEStatus(u)
            const isMarked = markedUnits.has(device ? device.position : u)

            return (
              <button
                key={u}
                onClick={() => toggleUnit(u)}
                className={`flex items-center gap-2 px-3 border rounded transition-all touch-manipulation ${getHEColor(device ? device.position : u)} ${
                  isMarked ? 'ring-1 ring-white/30' : ''
                }`}
                style={{ height: `${height * 26 + (height - 1)}px`, minHeight: '26px' }}
              >
                <span className="text-[10px] text-white/60 w-6 text-right font-mono shrink-0">{u}</span>
                <div className="flex-1 min-w-0">
                  {device ? (
                    <span className="text-xs text-white/90 truncate block">
                      {device.name} <span className="text-white/40">({device.formFactor})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30">leer</span>
                  )}
                </div>
                <div className="shrink-0">
                  {isMarked ? (
                    <span className={`text-xs font-medium ${
                      heStatus.status === 'correct' ? 'text-emerald-400' :
                      heStatus.status === 'unexpected' ? 'text-red-400' : 'text-white/60'
                    }`}>
                      ✓ belegt
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30">antippen</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm p-3 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-300">
          {markedUnits.size} von {totalUnits} HE als belegt markiert
        </div>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
        >
          Abgleich abschließen
        </button>
      </div>
    </div>
  )
}
