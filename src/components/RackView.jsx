export default function RackView({ rack, onDeviceClick }) {
  if (!rack) return null

  const UNIT_HEIGHT = 28
  const GAP = 2

  const getDeviceColor = (device) => {
    if (device.status !== device.plannedStatus || device.plannedModel) {
      return 'bg-red-500/80 border-red-400 hover:bg-red-500'
    }
    if (device.status === 'geplant') {
      return 'bg-yellow-500/60 border-yellow-400 hover:bg-yellow-500/80'
    }
    return 'bg-emerald-500/70 border-emerald-400 hover:bg-emerald-500'
  }

  const getStatusLabel = (device) => {
    if (device.status !== device.plannedStatus || device.plannedModel) return 'Abweichung'
    if (device.status === 'geplant') return 'Geplant'
    return 'Aktiv'
  }

  // Build a map of which units are occupied
  const unitMap = {}
  rack.devices.forEach(device => {
    if (device.position > 0) {
      for (let i = 0; i < device.height; i++) {
        unitMap[device.position + i] = device
      }
    }
  })

  // Render top (42) to bottom (1)
  const rows = []
  for (let u = rack.totalUnits; u >= 1; u--) {
    const device = unitMap[u]

    // Skip if this unit is part of a multi-unit device but not the top unit
    if (device && u !== device.position + device.height - 1) continue

    const height = device ? device.height : 1
    const rowHeight = height * UNIT_HEIGHT + (height - 1) * GAP

    rows.push(
      <div key={u} className="flex gap-2" style={{ height: `${rowHeight}px` }}>
        {/* Unit number */}
        <div className="w-8 shrink-0 flex items-center justify-end pr-1 text-[10px] text-gray-600">
          {u}
        </div>
        {/* Cell */}
        {device ? (
          <button
            onClick={() => onDeviceClick(device.id)}
            className={`flex-1 flex items-center gap-3 px-3 border rounded transition-colors cursor-pointer text-left ${getDeviceColor(device)}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{device.name}</div>
              <div className="text-xs text-white/70 truncate">{device.manufacturer} {device.model}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-white/60 uppercase">{device.formFactor}</div>
              <div className="text-[10px] text-white/80">{getStatusLabel(device)}</div>
            </div>
          </button>
        ) : (
          <div className="flex-1 bg-gray-800/40 border border-gray-800 rounded flex items-center justify-center">
            <span className="text-[10px] text-gray-600">leer</span>
          </div>
        )}
      </div>
    )
  }

  // Count stats
  const activeDevices = rack.devices.filter(d => d.status === 'aktiv').length
  const plannedDevices = rack.devices.filter(d => d.status === 'geplant').length
  const deviations = rack.devices.filter(d => d.status !== d.plannedStatus || d.plannedModel).length
  const usedUnits = rack.devices.reduce((sum, d) => sum + d.height, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{rack.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{rack.location}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{rack.totalUnits}</div>
          <div className="text-xs text-gray-500 mt-1">Höheneinheiten</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{activeDevices}</div>
          <div className="text-xs text-gray-500 mt-1">Aktive Geräte</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{plannedDevices}</div>
          <div className="text-xs text-gray-500 mt-1">Geplante Geräte</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{deviations}</div>
          <div className="text-xs text-gray-500 mt-1">Abweichungen</div>
        </div>
      </div>

      {/* Rack visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col gap-[2px]">
          {rows}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/70 border border-emerald-400"></div>
          Aktiv
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/60 border border-yellow-400"></div>
          Geplant
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/80 border border-red-400"></div>
          Abweichung
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-800/40 border border-gray-800"></div>
          Leer
        </div>
      </div>

      {/* Capacity bar */}
      <div className="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all"
          style={{ width: `${(usedUnits / rack.totalUnits) * 100}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Belegung: {usedUnits} / {rack.totalUnits} HE ({Math.round((usedUnits / rack.totalUnits) * 100)}%)
      </div>
    </div>
  )
}
