import { useState, useEffect } from 'react'
import { mockData } from './data/mockData'

// localStorage persistence: bumping this version invalidates older saves
// when the data shape changes.
const STORAGE_KEY = 'dc-vision-data-v1'

function loadInitialData() {
  if (typeof window === 'undefined') return mockData
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Sanity check: must look like our data shape
      if (parsed && Array.isArray(parsed.racks) && Array.isArray(parsed.cables)) {
        return parsed
      }
    }
  } catch {
    // Corrupted store — fall back to mock
  }
  return mockData
}
import Navigation from './components/Navigation'
import RackView from './components/RackView'
import DeviceDetail from './components/DeviceDetail'
import ComparisonView from './components/ComparisonView'
import CablingView from './components/CablingView'
import ARMarkerMode from './components/ARMarkerMode'
import QRCodePrintPage from './components/QRCodePrintPage'
import MarkerPrintPage from './components/MarkerPrintPage'

function App() {
  const [currentView, setCurrentView] = useState('rack')
  const [selectedRackId, setSelectedRackId] = useState('RACK-A01')
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [data, setData] = useState(loadInitialData)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Persist data to localStorage on every change so device edits survive reloads.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Quota exceeded or storage disabled — silently ignore
    }
  }, [data])

  const selectedRack = data.racks.find(r => r.id === selectedRackId)

  const handleDeviceClick = (deviceId) => {
    setSelectedDeviceId(deviceId)
    setCurrentView('device')
  }

  const handleBackToRack = () => {
    setSelectedDeviceId(null)
    setCurrentView('rack')
  }

  const handleUpdateDevice = (deviceId, updates) => {
    setData(prev => ({
      ...prev,
      racks: prev.racks.map(rack => ({
        ...rack,
        devices: rack.devices.map(device =>
          device.id === deviceId ? { ...device, ...updates } : device
        )
      }))
    }))
  }

  const handleAddDevice = (rackId, device) => {
    setData(prev => ({
      ...prev,
      racks: prev.racks.map(rack =>
        rack.id === rackId
          ? { ...rack, devices: [...rack.devices, device] }
          : rack
      )
    }))
  }

  const handleDeleteDevice = (deviceId) => {
    setData(prev => ({
      ...prev,
      racks: prev.racks.map(rack => ({
        ...rack,
        devices: rack.devices.filter(d => d.id !== deviceId)
      })),
      // Remove cables that referenced the deleted device on either end
      cables: prev.cables.filter(
        c => c.fromDevice !== deviceId && c.toDevice !== deviceId
      )
    }))
  }

  const handleAddRack = (rack) => {
    setData(prev => ({
      ...prev,
      racks: [...prev.racks, rack]
    }))
    setSelectedRackId(rack.id)
    setCurrentView('rack')
  }

  const handleDeleteRack = (rackId) => {
    if (typeof window !== 'undefined') {
      const rack = data.racks.find(r => r.id === rackId)
      const ok = window.confirm(`Rack "${rack?.name}" wirklich löschen? Alle Geräte und zugehörige Kabel werden entfernt.`)
      if (!ok) return
    }
    setData(prev => {
      // Collect all device IDs in this rack for cable cleanup
      const rack = prev.racks.find(r => r.id === rackId)
      const deviceIds = new Set(rack?.devices.map(d => d.id) ?? [])
      const portIds = new Set(rack?.devices.flatMap(d => (d.ports ?? []).map(p => p.id)) ?? [])
      return {
        ...prev,
        racks: prev.racks.filter(r => r.id !== rackId),
        cables: prev.cables.filter(
          c => !portIds.has(c.sourcePort) && !portIds.has(c.targetPort)
        )
      }
    })
    // Select another rack if available
    setSelectedRackId(prev => {
      const remaining = data.racks.filter(r => r.id !== rackId)
      if (remaining.length > 0) return remaining[0].id
      return ''
    })
  }

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        'Alle lokalen Änderungen verwerfen und Beispieldaten wiederherstellen?'
      )
      if (!ok) return
    }
    setData(mockData)
  }

  const handleExitAR = () => {
    setCurrentView('rack')
  }

  // AR mode is a fullscreen overlay
  if (currentView === 'ar') {
    return <ARMarkerMode racks={data.racks} onExit={handleExitAR} />
  }

  const renderView = () => {
    switch (currentView) {
      case 'rack':
        return (
          <RackView
            rack={selectedRack}
            onDeviceClick={handleDeviceClick}
            onAddDevice={handleAddDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
          />
        )
      case 'device':
        return (
          <DeviceDetail
            device={selectedRack?.devices.find(d => d.id === selectedDeviceId)}
            cables={data.cables}
            allDevices={data.racks.flatMap(r => r.devices)}
            onBack={handleBackToRack}
            onUpdateDevice={handleUpdateDevice}
          />
        )
      case 'comparison':
        return (
          <ComparisonView rack={selectedRack} />
        )
      case 'cabling':
        return (
          <CablingView
            rack={selectedRack}
            cables={data.cables}
            allDevices={data.racks.flatMap(r => r.devices)}
          />
        )
case 'qrcodes':
        return (
          <QRCodePrintPage racks={data.racks} onBack={() => setCurrentView('rack')} />
        )
      case 'markerprint':
        return (
          <MarkerPrintPage onBack={() => setCurrentView('rack')} />
        )
      default:
        return null
    }
  }

  // Close sidebar when navigating on mobile
  const handleViewChange = (view) => {
    setCurrentView(view)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-40 md:hidden p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white"
        aria-label="Menü öffnen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: always visible on md+, slide-in on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 md:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Navigation
          currentView={currentView}
          onViewChange={handleViewChange}
          racks={data.racks}
          selectedRackId={selectedRackId}
          onRackChange={setSelectedRackId}
          onAddRack={handleAddRack}
          onDeleteRack={handleDeleteRack}
          onResetData={handleResetData}
        />
      </div>

      <main className="flex-1 overflow-auto p-4 pt-14 md:p-6 md:pt-6">
        {renderView()}
      </main>
    </div>
  )
}

export default App
