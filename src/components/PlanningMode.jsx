export default function PlanningMode({ rack, onUpdateDevice }) {
  if (!rack) return null

  const UNIT_HEIGHT = 32
  const GAP = 2

  const devices = rack.devices.filter(d => d.position > 0)
  const installed = devices.filter(d => d.status === 'aktiv')
  const planned = devices.filter(d => d.status === 'geplant')

  const handleConfirmInstall = (deviceId) => {
    onUpdateDevice(deviceId, { status: 'aktiv', plannedStatus: 'aktiv' })
  }

  const unitMap = {}
  rack.devices.forEach(device => {
    if (device.position > 0) {
      for (let i = 0; i < device.height; i++) {
        unitMap[device.position + i] = device
      }
    }
  })

  const rows = []
  for (let u = rack.totalUnits; u >= 1; u--) {
    const device = unitMap[u]
    if (device && u !== device.position + device.height - 1) continue

    const height = device ? device.height : 1
    const rowHeight = height * UNIT_HEIGHT + (height - 1) * GAP

    rows.push(
      <div key={u} className="flex gap-2" style={{ height: `${rowHeight}px` }}>
        <div className="w-8 shrink-0 flex items-center justify-end pr-1 text-[10px] text-gray-600">
          {u}
        </div>
        {device ? (
          <div
            className={`flex-1 flex items-center gap-3 px-3 rounded transition-colors ${
              device.status === 'geplant'
                ? 'border-2 border-dashed border-yellow-500/50 bg-yellow-500/5'
                : 'border border-emerald-500 bg-emerald-500/20'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${device.status === 'geplant' ? 'text-yellow-300' : 'text-white'}`}>
                {device.name}
              </div>
              <div className="text-xs text-gray-400 truncate">{device.manufacturer} {device.model}</div>
            </div>
            <div className="shrink-0">
              {device.status === 'geplant' ? (
                <button
                  onClick={() => handleConfirmInstall(device.id)}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
                >
                  Einbau bestätigen
                </button>
              ) : (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  ✓ Eingebaut
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-800/20 border border-gray-800/50 border-dashed rounded flex items-center justify-center">
            <span className="text-[10px] text-gray-700">frei</span>
          </div>
        )}
      </div>
    )
  }

  const progress = devices.length > 0 ? (installed.length / devices.length) * 100 : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Planungsmodus</h2>
        <p className="text-sm text-gray-400 mt-1">{rack.name} – {rack.location}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Einbaufortschritt</h3>
          <span className="text-sm text-cyan-400 font-mono">
            {installed.length} / {devices.length}
          </span>
        </div>
        <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {installed.length} von {devices.length} Geräten eingebaut ({Math.round(progress)}%)
        </p>
        {installed.length === devices.length && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-400">
            Alle Geräte wurden erfolgreich eingebaut!
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col gap-[2px]">
          {rows}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Geräteliste</h3>
        <div className="space-y-2">
          {devices.map(device => (
            <div
              key={device.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                device.status === 'aktiv'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-gray-800/30 border-gray-700/50'
              }`}
            >
              <div>
                <div className="text-sm font-medium text-white">{device.name}</div>
                <div className="text-xs text-gray-400">{device.manufacturer} {device.model} · {device.formFactor} · HE {device.position}</div>
              </div>
              {device.status === 'geplant' ? (
                <button
                  onClick={() => handleConfirmInstall(device.id)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Einbau bestätigen
                </button>
              ) : (
                <span className="text-sm text-emerald-400 flex items-center gap-1">✓ Eingebaut</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border border-emerald-500 bg-emerald-500/20"></div>
          Eingebaut
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border-2 border-dashed border-yellow-500/50 bg-yellow-500/5"></div>
          Geplant
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border border-dashed border-gray-800/50 bg-gray-800/20"></div>
          Frei
        </div>
      </div>
    </div>
  )
}
