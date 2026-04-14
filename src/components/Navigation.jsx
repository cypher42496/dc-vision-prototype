import { useState } from 'react'

export default function Navigation({ currentView, onViewChange, racks, selectedRackId, onRackChange, onAddRack, onDeleteRack, onResetData }) {
  const [showRackForm, setShowRackForm] = useState(false)
  const [newRackName, setNewRackName] = useState('')
  const [newRackLocation, setNewRackLocation] = useState('')
  const [newRackUnits, setNewRackUnits] = useState(42)
  const navItems = [
    { id: 'rack', label: 'Rack-Übersicht', icon: '▦' },
    { id: 'comparison', label: 'Soll/Ist-Vergleich', icon: '⇄' },
    { id: 'cabling', label: 'Verkabelung', icon: '⚡' },
{ id: 'qrcodes', label: 'QR-Codes', icon: '⊞' },
    { id: 'markerprint', label: 'AR-Marker', icon: '◧' },
  ]

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-cyan-400 tracking-wide">DC Vision</h1>
        <p className="text-xs text-gray-500 mt-1">Prototyp – Rack-Visualisierung</p>
      </div>

      <div className="p-4 border-b border-gray-800">
        <label className="text-xs text-gray-500 uppercase tracking-wider">Rack auswählen</label>
        <select
          value={selectedRackId}
          onChange={(e) => onRackChange(e.target.value)}
          className="mt-2 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
        >
          {racks.map(rack => (
            <option key={rack.id} value={rack.id}>{rack.name} – {rack.location}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-2">
          {onAddRack && (
            <button
              onClick={() => setShowRackForm(true)}
              className="flex-1 px-2 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-xs hover:bg-cyan-500/20 transition-colors"
            >
              + Rack
            </button>
          )}
          {onDeleteRack && racks.length > 1 && (
            <button
              onClick={() => onDeleteRack(selectedRackId)}
              className="px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs hover:bg-red-500/20 transition-colors"
              title="Ausgewähltes Rack löschen"
            >
              🗑
            </button>
          )}
        </div>

        {showRackForm && (
          <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Rack-Name"
              value={newRackName}
              onChange={(e) => setNewRackName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Standort"
              value={newRackLocation}
              onChange={(e) => setNewRackLocation(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="number"
              placeholder="Höheneinheiten"
              min={1}
              max={50}
              value={newRackUnits}
              onChange={(e) => setNewRackUnits(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!newRackName.trim()) return
                  onAddRack({
                    id: `RACK-${Date.now().toString(36).toUpperCase()}`,
                    name: newRackName.trim(),
                    location: newRackLocation.trim(),
                    totalUnits: newRackUnits || 42,
                    devices: [],
                  })
                  setNewRackName('')
                  setNewRackLocation('')
                  setNewRackUnits(42)
                  setShowRackForm(false)
                }}
                disabled={!newRackName.trim()}
                className="flex-1 px-2 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs hover:bg-cyan-500/30 transition-colors disabled:opacity-40"
              >
                Erstellen
              </button>
              <button
                onClick={() => setShowRackForm(false)}
                className="px-2 py-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded text-xs hover:bg-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors text-sm ${
              currentView === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-800">
        <button
          onClick={() => onViewChange('ar')}
          className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
        >
          <span className="text-lg">🎯</span>
          AR-Modus
        </button>
      </div>

      {onResetData && (
        <div className="px-2 pb-2">
          <button
            onClick={onResetData}
            className="w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            title="Lokale Änderungen verwerfen"
          >
            ↺ Daten zurücksetzen
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
        Masterarbeit – AR/DCIM Prototyp
      </div>
    </aside>
  )
}
