export default function Navigation({ currentView, onViewChange, racks, selectedRackId, onRackChange }) {
  const navItems = [
    { id: 'rack', label: 'Rack-Übersicht', icon: '▦' },
    { id: 'comparison', label: 'Soll/Ist-Vergleich', icon: '⇄' },
    { id: 'cabling', label: 'Verkabelung', icon: '⚡' },
    { id: 'planning', label: 'Planungsmodus', icon: '📋' },
    { id: 'qrcodes', label: 'QR-Codes', icon: '⊞' },
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
          <span className="text-lg">📷</span>
          AR-Modus starten
        </button>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
        Masterarbeit – AR/DCIM Prototyp
      </div>
    </aside>
  )
}
