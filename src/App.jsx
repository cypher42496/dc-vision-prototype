import { useState } from 'react'
import { mockData } from './data/mockData'
import Navigation from './components/Navigation'
import RackView from './components/RackView'
import DeviceDetail from './components/DeviceDetail'
import ComparisonView from './components/ComparisonView'
import CablingView from './components/CablingView'
import PlanningMode from './components/PlanningMode'
import ARMode from './components/ARMode'
import ARMarkerMode from './components/ARMarkerMode'
import QRCodePrintPage from './components/QRCodePrintPage'
import MarkerPrintPage from './components/MarkerPrintPage'

function App() {
  const [currentView, setCurrentView] = useState('rack')
  const [selectedRackId, setSelectedRackId] = useState('RACK-A01')
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [data, setData] = useState(mockData)

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

  const handleExitAR = () => {
    setCurrentView('rack')
  }

  // AR mode is a fullscreen overlay
  if (currentView === 'ar') {
    return <ARMode racks={data.racks} onExit={handleExitAR} />
  }
  if (currentView === 'armarker') {
    return <ARMarkerMode racks={data.racks} onExit={handleExitAR} />
  }

  const renderView = () => {
    switch (currentView) {
      case 'rack':
        return (
          <RackView
            rack={selectedRack}
            onDeviceClick={handleDeviceClick}
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
      case 'planning':
        return (
          <PlanningMode
            rack={data.racks.find(r => r.id === 'RACK-A03')}
            onUpdateDevice={handleUpdateDevice}
          />
        )
      case 'qrcodes':
        return (
          <QRCodePrintPage onBack={() => setCurrentView('rack')} />
        )
      case 'markerprint':
        return (
          <MarkerPrintPage onBack={() => setCurrentView('rack')} />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        racks={data.racks}
        selectedRackId={selectedRackId}
        onRackChange={setSelectedRackId}
      />
      <main className="flex-1 overflow-auto p-6">
        {renderView()}
      </main>
    </div>
  )
}

export default App
