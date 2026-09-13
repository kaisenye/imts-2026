import { Routes, Route } from 'react-router-dom'
import { PasscodeGate } from './components/PasscodeGate'
import { BottomTabs } from './components/nav/BottomTabs'
import { Sidebar } from './components/nav/Sidebar'
import Playbook from './pages/Playbook'
import MapPage from './pages/MapPage'
import Targets from './pages/Targets'
import Company from './pages/Company'
import Contacts from './pages/Contacts'

export default function App() {
  return (
    <PasscodeGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-28 lg:pb-10">
          <Routes>
            <Route path="/" element={<Playbook />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/company/:id" element={<Company />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </main>
        <BottomTabs />
      </div>
    </PasscodeGate>
  )
}
