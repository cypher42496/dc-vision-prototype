import { QRCodeSVG } from 'qrcode.react'

const racks = [
  { id: 'RACK-A01', name: 'Rack A01', location: 'RZ Frankfurt, Raum 2.03, Reihe A' },
  { id: 'RACK-A02', name: 'Rack A02', location: 'RZ Frankfurt, Raum 2.03, Reihe A' },
  { id: 'RACK-A03', name: 'Rack A03', location: 'RZ Frankfurt, Raum 2.03, Reihe A' },
]

export default function QRCodePrintPage({ onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 flex items-center gap-1 print:hidden"
      >
        ← Zurück
      </button>

      <div className="mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-white">QR-Codes für Racks</h2>
        <p className="text-sm text-gray-400 mt-1">
          QR-Codes ausdrucken und an den entsprechenden Racks befestigen.
        </p>
        <button
          onClick={() => window.print()}
          className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
        >
          Seite drucken
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {racks.map(rack => (
          <div
            key={rack.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col items-center print:border-black print:bg-white print:rounded-none"
          >
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCodeSVG
                value={rack.id}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <h3 className="text-lg font-bold text-white print:text-black">{rack.name}</h3>
            <p className="text-sm text-gray-400 print:text-gray-600 mt-1">{rack.location}</p>
            <p className="text-xs text-gray-500 print:text-gray-500 mt-2 font-mono">{rack.id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
