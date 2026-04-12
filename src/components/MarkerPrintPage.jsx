import { useEffect, useState } from 'react'

// Generate the SVG string for an ArUco marker using the globally loaded
// js-aruco2 library (see index.html <script> tags). Falls back to a placeholder
// while the script is still loading.
function getMarkerSVG(id) {
  if (typeof window === 'undefined' || !window.AR) return null
  try {
    const dictionary = new window.AR.Dictionary('ARUCO_MIP_36h12')
    return dictionary.generateSVG(id)
  } catch (err) {
    console.warn('Marker generation failed:', err)
    return null
  }
}

const MARKERS = [
  {
    id: 0,
    label: 'MARKER 1',
    position: 'OBEN am Rack',
    hint: 'Direkt über der obersten nutzbaren Höheneinheit',
  },
  {
    id: 1,
    label: 'MARKER 2',
    position: 'UNTEN am Rack',
    hint: 'Direkt unter der untersten nutzbaren Höheneinheit',
  },
]

export default function MarkerPrintPage({ onBack }) {
  const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.AR)

  // Wait for js-aruco2 to finish loading (in case of race)
  useEffect(() => {
    if (ready) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      if (window.AR) {
        setReady(true)
      } else {
        setTimeout(tick, 50)
      }
    }
    tick()
    return () => { cancelled = true }
  }, [ready])

  const handlePrint = () => window.print()

  return (
    <div className="marker-print-root max-w-4xl mx-auto">
      {/* Screen-only header */}
      <div className="print:hidden mb-6">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 flex items-center gap-1"
        >
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold text-gray-100">AR-Marker</h2>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Diese zwei Marker ausdrucken (möglichst auf weißem Papier, am besten 120&nbsp;g+),
          ausschneiden und am physischen Rack befestigen. Sie dienen als Anker für die
          automatische HE-Grid-Erkennung im AR-Modus.
        </p>
        <button
          onClick={handlePrint}
          className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
        >
          Seite drucken
        </button>
      </div>

      {/* Instruction box (screen only) */}
      <div className="print:hidden mb-6 bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-100 mb-3">
          So bringst du die Marker an
        </h3>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
          <li>Seite ausdrucken. Prüfe nach dem Druck, dass jeder Marker exakt <strong>5 × 5 cm</strong> groß ist (Lineal). Falls nicht: Drucker-Skalierung auf 100&nbsp;% stellen.</li>
          <li><strong>Marker 1</strong> (ID 0) auf den Rack-Rahmen <em>oberhalb</em> der obersten nutzbaren Höheneinheit kleben – mittig auf der vertikalen Rack-Achse.</li>
          <li><strong>Marker 2</strong> (ID 1) auf den Rack-Rahmen <em>unterhalb</em> der untersten nutzbaren Höheneinheit kleben – ebenfalls mittig.</li>
          <li>Wichtig: beide Marker <strong>mit gleichem Abstand zur Rack-Mitte</strong> und <strong>gerade</strong> (nicht schräg) anbringen.</li>
          <li>Nach dem Anbringen kannst du die Marker dauerhaft am Rack lassen – der Drucker wird nur einmal benötigt.</li>
        </ol>
      </div>

      {/* Markers – visible on both screen and print */}
      <div className="marker-grid flex flex-col gap-8 items-center">
        {!ready && (
          <div className="text-gray-400 text-sm">Marker werden generiert …</div>
        )}
        {ready && MARKERS.map(marker => {
          const svg = getMarkerSVG(marker.id)
          return (
            <div
              key={marker.id}
              className="marker-card bg-white p-4 rounded-lg print:rounded-none print:p-0 flex flex-col items-center print:border-2 print:border-black"
            >
              <div
                className="marker-svg"
                style={{ width: '5cm', height: '5cm' }}
                dangerouslySetInnerHTML={{ __html: svg || '' }}
              />
              <div className="mt-3 text-center text-black">
                <div className="font-bold text-sm print:text-lg">{marker.label}</div>
                <div className="text-xs print:text-base">{marker.position}</div>
                <div className="text-[10px] print:text-sm text-gray-500 mt-1">
                  ID {marker.id} · ARUCO_MIP_36h12 · 5×5&nbsp;cm
                </div>
                <div className="text-[10px] print:text-sm text-gray-600 italic mt-1">
                  {marker.hint}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Print-mode overrides – same pattern as QRCodePrintPage */}
      <style>{`
        .marker-svg svg {
          width: 100%;
          height: 100%;
          display: block;
          image-rendering: pixelated;
        }

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

          .marker-print-root {
            display: block !important;
            width: 100% !important;
          }

          .marker-grid {
            display: block !important;
            gap: 0 !important;
            width: 100% !important;
          }

          .marker-card {
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
            background: white !important;
          }

          .marker-svg {
            width: 7cm !important;
            height: 7cm !important;
          }

          .marker-svg svg {
            width: 7cm !important;
            height: 7cm !important;
          }
        }
      `}</style>
    </div>
  )
}
