export default function ComparisonView({ rack, onStartScan }) {
  if (!rack) return null

  const scanResults = rack.lastScanResults || null
  const scanAt = rack.lastScanAt ? new Date(rack.lastScanAt) : null

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (scanResults) {
    const correct = scanResults.filter(r => r.status === 'correct')
    const missing = scanResults.filter(r => r.status === 'missing')
    const unexpected = scanResults.filter(r => r.status === 'unexpected')
    const total = scanResults.length
    const matchPercent = total > 0 ? Math.round((correct.length / total) * 100) : 0

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Soll-/Ist-Vergleich</h2>
          <p className="text-sm text-gray-400 mt-1">{rack.name} – {rack.location}</p>
        </div>

        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 mb-6">
          <div className="text-sm text-gray-400">
            Letzter Scan: <span className="text-white">{scanAt ? formatDate(scanAt) : '–'}</span>
          </div>
          <button
            onClick={onStartScan}
            className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors"
          >
            Neuer Scan
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-gray-500 mt-1">Positionen geprüft</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{correct.length}</div>
            <div className="text-xs text-gray-500 mt-1">Korrekt</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{missing.length + unexpected.length}</div>
            <div className="text-xs text-gray-500 mt-1">Abweichungen</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${matchPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {correct.length} von {total} Positionen korrekt ({matchPercent}%)
        </p>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider px-3">Soll (DCIM-Plan)</div>
          <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider px-3">Ist (letzter Scan)</div>
        </div>

        <div className="space-y-1">
          {scanResults.map((r, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded border ${
                r.status === 'missing' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700/50'
              }`}>
                <span className="text-xs text-gray-500 font-mono w-10 shrink-0">HE {r.he}</span>
                <span className="text-sm text-white truncate">{r.deviceName || '–'}</span>
                <span className="text-xs text-gray-500 ml-auto shrink-0">{r.soll}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded border ${
                r.status === 'correct'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <span className={`text-sm shrink-0 ${r.status === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.status === 'correct' ? '✓' : '✗'}
                </span>
                <span className="text-sm text-white truncate">
                  {r.status === 'unexpected' ? 'Unbekanntes Gerät' : r.deviceName || '–'}
                </span>
                <span className={`text-xs ml-auto shrink-0 ${r.status === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.status === 'correct' ? 'korrekt' : r.status === 'missing' ? 'fehlt' : 'unerwartet'}
                </span>
              </div>
            </div>
          ))}
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

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <h3 className="text-lg font-semibold text-white mb-2">Noch kein Scan vorhanden</h3>
        <p className="text-sm text-gray-400 mb-6">
          Führe einen Rack-Scan durch, um den Ist-Zustand mit dem DCIM-Plan zu vergleichen.
          Das Ergebnis wird hier dauerhaft gespeichert.
        </p>
        <button
          onClick={onStartScan}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
        >
          Scan starten
        </button>
      </div>
    </div>
  )
}
