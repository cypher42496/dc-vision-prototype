export default function ComparisonSummary({ rackName, results, onScanNew, onBackToApp }) {
  const correct = results.filter(r => r.status === 'correct')
  const missing = results.filter(r => r.status === 'missing')
  const unexpected = results.filter(r => r.status === 'unexpected')
  const deviations = [...missing, ...unexpected]
  const total = results.length

  const matchPercent = total > 0 ? Math.round((correct.length / total) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 overflow-auto">
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-1">Abgleich abgeschlossen</h2>
        <p className="text-sm text-gray-400 mb-6">{rackName}</p>

        {/* Summary cards */}
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
            <div className="text-2xl font-bold text-red-400">{deviations.length}</div>
            <div className="text-xs text-gray-500 mt-1">Abweichungen</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-800 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${matchPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {correct.length} von {total} Positionen korrekt ({matchPercent}%)
        </p>

        {/* Correct positions */}
        {correct.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Korrekte Positionen ({correct.length})
            </h3>
            <div className="space-y-1">
              {correct.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded px-3 py-2">
                  <span className="text-emerald-400 text-sm">✓</span>
                  <span className="text-xs text-gray-400 font-mono w-12">HE {r.he}</span>
                  <span className="text-sm text-white">{r.deviceName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing devices */}
        {missing.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
              Fehlende Geräte ({missing.length})
            </h3>
            <div className="space-y-1">
              {missing.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
                  <span className="text-red-400 text-sm">✗</span>
                  <span className="text-xs text-gray-400 font-mono w-12">HE {r.he}</span>
                  <div>
                    <span className="text-sm text-white">{r.deviceName}</span>
                    <span className="text-xs text-red-400 ml-2">– Soll: belegt, Ist: leer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unexpected devices */}
        {unexpected.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
              Unerwartete Geräte ({unexpected.length})
            </h3>
            <div className="space-y-1">
              {unexpected.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
                  <span className="text-red-400 text-sm">⚠</span>
                  <span className="text-xs text-gray-400 font-mono w-12">HE {r.he}</span>
                  <div>
                    <span className="text-sm text-white">Unbekanntes Gerät</span>
                    <span className="text-xs text-red-400 ml-2">– Soll: leer, Ist: belegt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No deviations */}
        {deviations.length === 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center mb-6">
            <div className="text-lg text-emerald-400 font-medium">Keine Abweichungen!</div>
            <div className="text-sm text-gray-400 mt-1">Alle Positionen stimmen mit dem DCIM-Plan überein.</div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onScanNew}
            className="flex-1 px-4 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
          >
            Neues Rack scannen
          </button>
          <button
            onClick={onBackToApp}
            className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Zurück zur Rack-Übersicht
          </button>
        </div>
      </div>
    </div>
  )
}
