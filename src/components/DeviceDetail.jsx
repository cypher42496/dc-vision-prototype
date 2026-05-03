export default function DeviceDetail({ device, cables, allDevices, onBack, onUpdateDevice }) {
  if (!device) return null

  const hasDeviation = device.status !== device.plannedStatus || device.plannedModel

  const getPortStatusColor = (port) => {
    if (port.status !== port.plannedStatus) return 'text-red-400'
    if (port.status === 'verbunden') return 'text-emerald-400'
    return 'text-gray-500'
  }

  const getPortStatusIcon = (port) => {
    if (port.status !== port.plannedStatus) return '⚠'
    if (port.status === 'verbunden') return '●'
    return '○'
  }

  const findConnectedDevice = (port) => {
    if (!port.connectedTo) return null
    for (const dev of allDevices) {
      const found = dev.ports?.find(p => p.id === port.connectedTo)
      if (found) return { device: dev, port: found }
    }
    return null
  }

  const getCable = (port) => {
    if (!port.cableId) return null
    return cables.find(c => c.id === port.cableId)
  }

  const handleReportDeviation = () => {
    onUpdateDevice(device.id, { status: 'abweichend' })
  }

  const handleConfirmStatus = () => {
    onUpdateDevice(device.id, {
      status: 'produktiv',
      plannedStatus: 'produktiv',
      plannedModel: undefined
    })
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 flex items-center gap-1"
      >
        ← Zurück zur Rack-Übersicht
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{device.name}</h2>
            <p className="text-gray-400 mt-1">{device.manufacturer} {device.model}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            hasDeviation
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : device.status === 'geplant'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {hasDeviation ? 'Abweichung' : device.status === 'geplant' ? 'Geplant' : 'Aktiv'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-xs text-gray-500 uppercase">Position</div>
            <div className="text-sm text-white mt-1">HE {device.position}–{device.position + device.height - 1}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Formfaktor</div>
            <div className="text-sm text-white mt-1">{device.formFactor}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Status (Ist)</div>
            <div className="text-sm text-white mt-1">{device.status}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Status (Soll)</div>
            <div className="text-sm text-white mt-1">{device.plannedStatus}</div>
          </div>
        </div>

        {device.plannedModel && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-xs text-red-400 font-medium">Modell-Abweichung</div>
            <div className="text-sm text-gray-300 mt-1">
              Geplant: <span className="text-white">{device.plannedModel}</span> →
              Verbaut: <span className="text-white">{device.model}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReportDeviation}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Abweichung melden
          </button>
          <button
            onClick={handleConfirmStatus}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
          >
            Status bestätigen
          </button>
        </div>
      </div>

      {device.ports && device.ports.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ports & Verbindungen</h3>
          <div className="space-y-2">
            {device.ports.map(port => {
              const connected = findConnectedDevice(port)
              const cable = getCable(port)
              return (
                <div
                  key={port.id}
                  className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-4 py-3"
                >
                  <span className={`text-lg ${getPortStatusColor(port)}`}>
                    {getPortStatusIcon(port)}
                  </span>
                  <div className="w-20 shrink-0">
                    <div className="text-sm text-white font-mono">{port.name}</div>
                    <div className="text-[10px] text-gray-500">{port.type}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {connected ? (
                      <>
                        <div className="text-sm text-gray-300">
                          → <span className="text-cyan-400">{connected.device.name}</span>
                          <span className="text-gray-500"> : {connected.port.name}</span>
                        </div>
                        {(connected.device.status === 'verschollen' || connected.device.status === 'defekt') && (
                          <div className="text-xs text-orange-400 mt-0.5">
                            ⚠ Gegenstelle als {connected.device.status} gemeldet – Verbindung laut Plan aktiv
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-600">Nicht verbunden</div>
                    )}
                  </div>
                  {cable && (
                    <div className="text-xs text-gray-500 shrink-0">
                      {cable.label} ({cable.type}, {cable.length})
                    </div>
                  )}
                  {port.status !== port.plannedStatus && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                      Soll: {port.plannedStatus}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
