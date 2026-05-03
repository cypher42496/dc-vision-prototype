import { useEffect, useRef, useState } from 'react'

function safeStopScanner(scanner) {
  if (!scanner) return
  try {
    const state = scanner.getState?.()
    if (state === 2 || state === 3) {
      scanner.stop().catch(() => {})
    }
  } catch {
  }
}

export default function QRScanner({ onScan, onCancel, validRackIds }) {
  const [error, setError] = useState(null)
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    let scannerStarted = false

    const timer = setTimeout(async () => {
      if (cancelledRef.current) return

      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelledRef.current) return

        const el = document.getElementById('qr-reader')
        if (!el) {
          setError('no-camera')
          return
        }

        const html5QrCode = new Html5Qrcode('qr-reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (validRackIds.includes(decodedText)) {
              safeStopScanner(html5QrCode)
              scannerRef.current = null
              onScan(decodedText)
            } else {
              setError(`Unbekanntes Rack: "${decodedText}"`)
              setTimeout(() => setError(null), 3000)
            }
          },
          () => {}
        )

        scannerStarted = true
        if (!cancelledRef.current) setScannerReady(true)
      } catch (err) {
        if (!cancelledRef.current) {
          console.warn('QR Scanner error:', err)
          setError('no-camera')
        }
      }
    }, 200)

    return () => {
      cancelledRef.current = true
      clearTimeout(timer)
      safeStopScanner(scannerRef.current)
      scannerRef.current = null
    }
  }, [])

  const handleCancel = () => {
    cancelledRef.current = true
    safeStopScanner(scannerRef.current)
    scannerRef.current = null
    onCancel()
  }

  if (error === 'no-camera') {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-xl font-bold text-white mb-2">Kamera nicht verfügbar</h2>
          <p className="text-sm text-gray-400 mb-6">
            Kamerazugriff benötigt HTTPS oder localhost mit einer echten Kamera.
            Wähle ein Rack manuell aus, um den Abgleich zu testen:
          </p>
          <div className="space-y-2 mb-6">
            {validRackIds.map(id => (
              <button
                key={id}
                onClick={() => onScan(id)}
                className="w-full px-4 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">QR-Code am Rack scannen</h2>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-gray-800/80 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div id="qr-reader" className="w-full max-w-lg" />
      </div>

      {error && error !== 'no-camera' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg text-sm shadow-lg">
          {error}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
        <p className="text-sm text-gray-300">
          {scannerReady
            ? 'Richte die Kamera auf den QR-Code am Rack'
            : 'Kamera wird gestartet…'
          }
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Unterstützte Racks: RACK-A01, RACK-A02, RACK-A03
        </p>
      </div>
    </div>
  )
}
