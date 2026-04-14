import { useState } from 'react'
import DeviceEditor from './DeviceEditor'

const VIEW_MODES = [
  { id: 'normal', label: 'Standard' },
  { id: 'security', label: '🔒 Sicherheit' },
  { id: 'environment', label: '🌿 Umwelt' },
  { id: 'network', label: '🔌 Netzwerk' },
]

export default function RackView({ rack, onDeviceClick, onAddDevice, onUpdateDevice, onDeleteDevice }) {
  const [editorState, setEditorState] = useState(null)
  const [viewMode, setViewMode] = useState('normal')

  if (!rack) return null

  const UNIT_HEIGHT = 28
  const GAP = 2

  // --- Helper: check if a device has network ports ---
  const hasNetworkPorts = (device) => device.ports && device.ports.length > 0
  const getConnectedPortCount = (device) =>
    (device.ports ?? []).filter(p => p.connectedTo).length

  // --- Color logic depends on view mode ---
  const getDeviceColor = (device) => {
    if (viewMode === 'security') {
      return device.securityInfo
        ? 'bg-blue-500/70 border-blue-400'
        : 'bg-gray-700/50 border-gray-600'
    }
    if (viewMode === 'environment') {
      return device.environmentInfo
        ? 'bg-blue-500/70 border-blue-400'
        : 'bg-gray-700/50 border-gray-600'
    }
    if (viewMode === 'network') {
      return hasNetworkPorts(device)
        ? 'bg-blue-500/70 border-blue-400'
        : 'bg-gray-700/50 border-gray-600'
    }
    // normal mode
    if (device.status !== device.plannedStatus || device.plannedModel) {
      return 'bg-red-500/80 border-red-400 hover:bg-red-500'
    }
    if (device.status === 'geplant') {
      return 'bg-yellow-500/60 border-yellow-400 hover:bg-yellow-500/80'
    }
    if (device.status === 'defekt') {
      return 'bg-orange-500/70 border-orange-400 hover:bg-orange-500'
    }
    if (device.status === 'verschollen') {
      return 'bg-purple-500/70 border-purple-400 hover:bg-purple-500'
    }
    return 'bg-emerald-500/70 border-emerald-400 hover:bg-emerald-500'
  }

  const getStatusLabel = (device) => {
    if (viewMode === 'security') {
      return device.securityInfo ? 'Info vorhanden' : 'Keine Info'
    }
    if (viewMode === 'environment') {
      return device.environmentInfo ? 'Info vorhanden' : 'Keine Info'
    }
    if (viewMode === 'network') {
      if (!hasNetworkPorts(device)) return 'Keine Ports'
      const connected = getConnectedPortCount(device)
      const total = device.ports.length
      return `${connected}/${total} verbunden`
    }
    if (device.status !== device.plannedStatus || device.plannedModel) return 'Abweichung'
    if (device.status === 'geplant') return 'Geplant'
    if (device.status === 'defekt') return 'Defekt'
    if (device.status === 'verschollen') return 'Verschollen'
    return 'Produktiv'
  }

  // Sub-line shown in audit/network modes
  const getAuditSnippet = (device) => {
    if (viewMode === 'security' && device.securityInfo) {
      return device.securityInfo.length > 60
        ? device.securityInfo.slice(0, 60) + '…'
        : device.securityInfo
    }
    if (viewMode === 'environment' && device.environmentInfo) {
      return device.environmentInfo.length > 60
        ? device.environmentInfo.slice(0, 60) + '…'
        : device.environmentInfo
    }
    if (viewMode === 'network' && hasNetworkPorts(device)) {
      const portSummary = device.ports
        .slice(0, 3)
        .map(p => `${p.name} (${p.type})`)
        .join(', ')
      return device.ports.length > 3
        ? portSummary + ` +${device.ports.length - 3} weitere`
        : portSummary
    }
    return null
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

  // Render top to bottom
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
            className={`flex-1 flex items-center gap-3 px-3 border rounded transition-colors text-left ${getDeviceColor(device)}`}
          >
            <button
              onClick={() => onDeviceClick(device.id)}
              className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{device.name}</div>
                {viewMode === 'normal' ? (
                  <div className="text-xs text-white/70 truncate">{device.manufacturer} {device.model}</div>
                ) : (
                  <div className="text-[10px] text-white/60 truncate">
                    {getAuditSnippet(device) || `${device.manufacturer} ${device.model}`}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-white/60 uppercase">{device.formFactor}</div>
                <div className="text-[10px] text-white/80">{getStatusLabel(device)}</div>
              </div>
            </button>
            {onUpdateDevice && viewMode === 'normal' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditorState({ mode: 'edit', device })
                }}
                title="Gerät bearbeiten"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-black/30 hover:bg-black/50 text-white text-xs transition-colors"
              >
                ✎
              </button>
            )}
          </div>
        ) : (
          onAddDevice && viewMode === 'normal' ? (
            <button
              onClick={() => setEditorState({ mode: 'add', position: u })}
              title={`Gerät auf HE ${u} hinzufügen`}
              className="flex-1 bg-gray-800/40 border border-gray-800 rounded flex items-center justify-center hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors group"
            >
              <span className="text-[10px] text-gray-600 group-hover:text-cyan-400">
                + leer
              </span>
            </button>
          ) : (
            <div className="flex-1 bg-gray-800/40 border border-gray-800 rounded flex items-center justify-center">
              <span className="text-[10px] text-gray-600">leer</span>
            </div>
          )
        )}
      </div>
    )
  }

  // Count stats
  const activeDevices = rack.devices.filter(d => d.status === 'produktiv').length
  const plannedDevices = rack.devices.filter(d => d.status === 'geplant').length
  const deviations = rack.devices.filter(d => d.status !== d.plannedStatus || d.plannedModel).length
  const usedUnits = rack.devices.reduce((sum, d) => sum + d.height, 0)

  // Audit mode stats
  const securityCount = rack.devices.filter(d => d.securityInfo).length
  const environmentCount = rack.devices.filter(d => d.environmentInfo).length
  const networkDeviceCount = rack.devices.filter(d => hasNetworkPorts(d)).length
  const totalPorts = rack.devices.reduce((sum, d) => sum + (d.ports?.length ?? 0), 0)
  const connectedPorts = rack.devices.reduce((sum, d) => sum + getConnectedPortCount(d), 0)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{rack.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{rack.location}</p>
        </div>
        {onAddDevice && viewMode === 'normal' && (
          <button
            onClick={() => setEditorState({ mode: 'add' })}
            className="shrink-0 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
          >
            + Gerät hinzufügen
          </button>
        )}
      </div>

      {/* View mode toggle — horizontally scrollable on mobile */}
      <div className="flex items-center gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1 overflow-x-auto max-w-full scrollbar-hide">
        {VIEW_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === mode.id
                ? mode.id === 'normal'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Stats — changes by mode */}
      {viewMode === 'normal' ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{rack.totalUnits}</div>
            <div className="text-xs text-gray-500 mt-1">Höheneinheiten</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">{activeDevices}</div>
            <div className="text-xs text-gray-500 mt-1">Produktive Geräte</div>
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
      ) : viewMode === 'network' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{networkDeviceCount}</div>
            <div className="text-xs text-gray-500 mt-1">Geräte mit Ports</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{totalPorts}</div>
            <div className="text-xs text-gray-500 mt-1">Ports gesamt</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">{connectedPorts}</div>
            <div className="text-xs text-gray-500 mt-1">Verbunden</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-500">{totalPorts - connectedPorts}</div>
            <div className="text-xs text-gray-500 mt-1">Frei</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{rack.devices.length}</div>
            <div className="text-xs text-gray-500 mt-1">Geräte gesamt</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {viewMode === 'security' ? securityCount : environmentCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {viewMode === 'security' ? 'Mit Sicherheitsinfo' : 'Mit Umweltinfo'}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-500">
              {rack.devices.length - (viewMode === 'security' ? securityCount : environmentCount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Ohne Info</div>
          </div>
        </div>
      )}

      {/* Rack visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col gap-[2px]">
          {rows}
        </div>
      </div>

      {/* Legend — changes by mode */}
      {viewMode === 'normal' ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/70 border border-emerald-400"></div>
            Produktiv
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500/60 border border-yellow-400"></div>
            Geplant
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/70 border border-orange-400"></div>
            Defekt
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500/70 border border-purple-400"></div>
            Verschollen
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
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/70 border border-blue-400"></div>
            {viewMode === 'network'
              ? 'Netzwerk-Ports vorhanden'
              : viewMode === 'security'
                ? 'Sicherheitsinfo vorhanden'
                : 'Umweltinfo vorhanden'}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-700/50 border border-gray-600"></div>
            {viewMode === 'network' ? 'Keine Ports' : 'Keine Info hinterlegt'}
          </div>
        </div>
      )}

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

      {editorState && (
        <DeviceEditor
          rack={rack}
          device={editorState.mode === 'edit' ? editorState.device : undefined}
          initialPosition={editorState.mode === 'add' ? editorState.position : undefined}
          onSave={(device) => {
            if (editorState.mode === 'edit') {
              onUpdateDevice(device.id, device)
            } else {
              onAddDevice(rack.id, device)
            }
            setEditorState(null)
          }}
          onDelete={(deviceId) => {
            onDeleteDevice(deviceId)
            setEditorState(null)
          }}
          onCancel={() => setEditorState(null)}
        />
      )}
    </div>
  )
}
