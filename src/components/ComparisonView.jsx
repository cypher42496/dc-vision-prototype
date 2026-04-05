export default function ComparisonView({ rack }) {
  if (!rack) return null

  const devices = rack.devices.filter(d => d.position > 0)
  const matchCount = devices.filter(d => d.status === d.plannedStatus && !d.plannedModel).length
  const deviationCount = devices.length - matchCount

  const getDeviationReason = (device) => {
    const reasons = []
    if (device.plannedModel) {
      reasons.push(`Modell: ${device.plannedModel} → ${device.model}`)
    }
    if (device.plannedStatus === 'nicht vorhanden') {
      reasons.push('Gerät nicht geplant, aber vorhanden')
    } else if (device.status !== device.plannedStatus) {
      reasons.push(`Status: Soll "${device.plannedStatus}", Ist "${device.status}"`)
    }
    // Check port deviations
    const portDevs = device.ports?.filter(p => p.status !== p.plannedStatus) || []
    if (portDevs.length > 0) {
      reasons.push(`${portDevs.length} Port-Abweichung(en)`)
    }
    return reasons
  }

  const renderDeviceRow = (device, side) => {
    const isPlanned = side === 'planned'
    const hasDeviation = device.status !== device.plannedStatus || device.plannedModel

    return (
      <div className={`p-3 rounded-lg border ${
        hasDeviation
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-gray-800/50 border-gray-700/50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">{device.name}</div>
            <div className="text-xs text-gray-400">
              {isPlanned ? (device.plannedModel || device.model) : device.model}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">HE {device.position}</div>
            <div className={`text-xs ${hasDeviation ? 'text-red-400' : 'text-emerald-400'}`}>
              {isPlanned ? device.plannedStatus : device.status}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Soll-/Ist-Vergleich</h2>
        <p className="text-sm text-gray-400 mt-1">{rack.name} – {rack.location}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{devices.length}</div>
          <div className="text-xs text-gray-500 mt-1">Geräte gesamt</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{matchCount}</div>
          <div className="text-xs text-gray-500 mt-1">Übereinstimmend</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{deviationCount}</div>
          <div className="text-xs text-gray-500 mt-1">Abweichungen</div>
        </div>
      </div>

      {/* Match bar */}
      <div className="bg-gray-800 rounded-full h-3 overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(matchCount / devices.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 mb-6 -mt-4">
        {matchCount} von {devices.length} Geräten stimmen überein ({Math.round((matchCount / devices.length) * 100)}%)
      </p>

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
            Soll (DCIM-Plan)
          </h3>
          <div className="space-y-2">
            {devices.map(device => (
              <div key={device.id}>{renderDeviceRow(device, 'planned')}</div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
            Ist (Realer Zustand)
          </h3>
          <div className="space-y-2">
            {devices.map(device => (
              <div key={device.id}>{renderDeviceRow(device, 'actual')}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Deviation details */}
      {deviationCount > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Abweichungen im Detail</h3>
          <div className="space-y-3">
            {devices
              .filter(d => d.status !== d.plannedStatus || d.plannedModel)
              .map(device => (
                <div key={device.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-white">{device.name}</div>
                  <ul className="mt-2 space-y-1">
                    {getDeviationReason(device).map((reason, i) => (
                      <li key={i} className="text-sm text-red-300 flex items-center gap-2">
                        <span className="text-red-400">⚠</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
