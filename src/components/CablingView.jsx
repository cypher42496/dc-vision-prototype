import { useState } from 'react'

export default function CablingView({ rack, cables, allDevices }) {
  const [selectedCable, setSelectedCable] = useState(null)

  if (!rack) return null

  // Get all ports from this rack's devices
  const rackPorts = rack.devices.flatMap(d =>
    (d.ports || []).map(p => ({ ...p, deviceName: d.name, deviceId: d.id }))
  )

  // Find cables connected to this rack
  const rackPortIds = new Set(rackPorts.map(p => p.id))
  const relevantCables = cables.filter(
    c => rackPortIds.has(c.sourcePort) || rackPortIds.has(c.targetPort)
  )

  const findPortInfo = (portId) => {
    for (const dev of allDevices) {
      const port = dev.ports?.find(p => p.id === portId)
      if (port) return { port, device: dev }
    }
    return null
  }

  const getCableStatus = (cable) => {
    const source = findPortInfo(cable.sourcePort)
    const target = findPortInfo(cable.targetPort)
    if (!source || !target) return 'error'
    const sourceOk = source.port.status === source.port.plannedStatus
    const targetOk = target.port.status === target.port.plannedStatus
    if (sourceOk && targetOk) return 'ok'
    return 'deviation'
  }

  const getCableColor = (status) => {
    switch (status) {
      case 'ok': return 'border-emerald-500/50 bg-emerald-500/5'
      case 'deviation': return 'border-red-500/50 bg-red-500/5'
      default: return 'border-gray-600 bg-gray-800/30'
    }
  }

  const getCableLineColor = (status) => {
    switch (status) {
      case 'ok': return 'bg-emerald-500'
      case 'deviation': return 'bg-red-500'
      default: return 'bg-gray-600'
    }
  }

  const okCount = relevantCables.filter(c => getCableStatus(c) === 'ok').length
  const devCount = relevantCables.filter(c => getCableStatus(c) === 'deviation').length

  // Also find ports that should be connected but aren't
  const disconnectedPorts = rackPorts.filter(
    p => p.plannedStatus === 'verbunden' && p.status === 'nicht verbunden'
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Verkabelungsansicht</h2>
        <p className="text-sm text-gray-400 mt-1">{rack.name} – {rack.location}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{relevantCables.length}</div>
          <div className="text-xs text-gray-500 mt-1">Kabelverbindungen</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{okCount}</div>
          <div className="text-xs text-gray-500 mt-1">Korrekt</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{devCount}</div>
          <div className="text-xs text-gray-500 mt-1">Abweichungen</div>
        </div>
      </div>

      {/* Cable list */}
      <div className="space-y-2">
        {relevantCables.map(cable => {
          const status = getCableStatus(cable)
          const source = findPortInfo(cable.sourcePort)
          const target = findPortInfo(cable.targetPort)
          const isSelected = selectedCable === cable.id

          return (
            <button
              key={cable.id}
              onClick={() => setSelectedCable(isSelected ? null : cable.id)}
              className={`w-full text-left border rounded-lg p-4 transition-colors ${getCableColor(status)} ${
                isSelected ? 'ring-1 ring-cyan-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Source */}
                <div className="flex-1 text-right">
                  <div className="text-sm text-white">{source?.device.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{source?.port.name}</div>
                </div>

                {/* Cable line */}
                <div className="flex items-center gap-1 px-2">
                  <div className={`w-2 h-2 rounded-full ${getCableLineColor(status)}`} />
                  <div className={`w-16 h-0.5 ${getCableLineColor(status)}`} />
                  <div className={`w-2 h-2 rounded-full ${getCableLineColor(status)}`} />
                </div>

                {/* Target */}
                <div className="flex-1">
                  <div className="text-sm text-white">{target?.device.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{target?.port.name}</div>
                </div>

                {/* Cable info */}
                <div className="text-right shrink-0 ml-4">
                  <div className="text-xs text-gray-500">{cable.label}</div>
                  <div className="text-xs text-gray-600">{cable.type} · {cable.length}</div>
                </div>
              </div>

              {/* Expanded detail */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Kabel-ID:</span>
                    <span className="text-white ml-1">{cable.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Typ:</span>
                    <span className="text-white ml-1">{cable.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Länge:</span>
                    <span className="text-white ml-1">{cable.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-1 ${status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {status === 'ok' ? 'Korrekt' : 'Abweichung'}
                    </span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Disconnected ports */}
      {disconnectedPorts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Fehlende Verbindungen ({disconnectedPorts.length})
          </h3>
          <div className="space-y-2">
            {disconnectedPorts.map(port => (
              <div
                key={port.id}
                className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3"
              >
                <span className="text-gray-500 text-lg">○</span>
                <div>
                  <div className="text-sm text-white">
                    {port.deviceName} : <span className="font-mono text-gray-400">{port.name}</span>
                  </div>
                  <div className="text-xs text-red-400">Soll verbunden sein, ist nicht angeschlossen</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500"></div>
          Korrekt verbunden
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500"></div>
          Abweichung
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-600"></div>
          Nicht verbunden
        </div>
      </div>
    </div>
  )
}
