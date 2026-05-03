import { QRCodeSVG } from 'qrcode.react'

export default function QRCodePrintPage({ racks, onBack }) {
  return (
    <div className="qr-print-root">
      <div className="print:hidden">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 flex items-center gap-1"
        >
          ← Zurück
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">QR-Codes für Racks</h2>
          <p className="text-sm text-gray-400 mt-1">
            QR-Codes ausdrucken und an den entsprechenden Racks befestigen.
            Beim Drucken werden zwei QR-Codes pro A4-Seite ausgegeben.
          </p>
          <button
            onClick={() => window.print()}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
          >
            Seite drucken
          </button>
        </div>
      </div>

      <div className="qr-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {racks.map(rack => (
          <div
            key={rack.id}
            className="qr-card bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col items-center print:border-2 print:border-black print:bg-white print:rounded-none"
          >
            <div className="bg-white p-4 rounded-lg mb-4 print:p-2 print:mb-3">
              <QRCodeSVG
                value={rack.id}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <h3 className="text-lg font-bold text-white print:text-black print:text-2xl">{rack.name}</h3>
            <p className="text-sm text-gray-400 print:text-gray-700 print:text-base mt-1 text-center">
              {rack.location}
            </p>
            <p className="text-xs text-gray-500 print:text-gray-500 print:text-sm mt-2 font-mono">
              {rack.id}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }

          html, body, #root {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }

          body > div,
          #root > div {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }

          aside {
            display: none !important;
          }

          main {
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            flex: none !important;
            width: 100% !important;
          }

          .qr-print-root {
            display: block !important;
            width: 100% !important;
          }

          .qr-grid {
            display: block !important;
            grid-template-columns: none !important;
            gap: 0 !important;
            width: 100% !important;
          }

          .qr-card {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 12cm !important;
            margin: 0 0 1cm 0 !important;
            padding: 0.8cm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .qr-card svg {
            width: 7cm !important;
            height: 7cm !important;
          }
        }
      `}</style>
    </div>
  )
}
