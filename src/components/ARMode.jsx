import { useState, Component } from 'react'
import QRScanner from './QRScanner'
import HEGrid from './HEGrid'
import ComparisonSummary from './ComparisonSummary'

class ARErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.warn('AR Mode error:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Fehler im AR-Modus</h2>
            <p className="text-sm text-gray-400 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Dies kann an fehlenden Kamera-Berechtigungen liegen.
            </p>
            <button
              onClick={this.props.onExit}
              className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Zurück zur App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ARModeInner({ racks, onExit }) {
  const [phase, setPhase] = useState('scanning') // scanning | grid | summary
  const [selectedRack, setSelectedRack] = useState(null)
  const [results, setResults] = useState(null)

  const validRackIds = racks.map(r => r.id)

  const handleScan = (rackId) => {
    const rack = racks.find(r => r.id === rackId)
    if (rack) {
      setSelectedRack(rack)
      setPhase('grid')
    }
  }

  const handleGridComplete = (comparisonResults) => {
    setResults(comparisonResults)
    setPhase('summary')
  }

  const handleScanNew = () => {
    setSelectedRack(null)
    setResults(null)
    setPhase('scanning')
  }

  if (phase === 'scanning') {
    return (
      <QRScanner
        validRackIds={validRackIds}
        onScan={handleScan}
        onCancel={onExit}
      />
    )
  }

  if (phase === 'grid' && selectedRack) {
    return (
      <HEGrid
        rack={selectedRack}
        onComplete={handleGridComplete}
        onCancel={onExit}
      />
    )
  }

  if (phase === 'summary' && results) {
    return (
      <ComparisonSummary
        rackName={selectedRack.name}
        results={results}
        onScanNew={handleScanNew}
        onBackToApp={onExit}
      />
    )
  }

  return null
}

export default function ARMode({ racks, onExit }) {
  return (
    <ARErrorBoundary onExit={onExit}>
      <ARModeInner racks={racks} onExit={onExit} />
    </ARErrorBoundary>
  )
}
