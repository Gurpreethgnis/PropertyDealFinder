import { useState } from 'react'
import Head from 'next/head'
import DealsTable from '@/components/DealsTable'
import MapView from '@/components/MapView'
import UnderwriteForm from '@/components/UnderwriteForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function Dashboard() {
  const [activeView, setActiveView] = useState<'deals' | 'map' | 'underwrite'>('deals')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const views = {
    deals: { label: 'Deals Table', component: <DealsTable /> },
    map: { label: 'Map View', component: <MapView /> },
    underwrite: { label: 'Underwrite Form', component: <UnderwriteForm /> }
  }

  return (
    <>
      <Head>
        <title>Dashboard - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            activeView={activeView}
            onViewChange={setActiveView}
          />
          
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {views[activeView].label}
              </h1>
              <p className="text-gray-600 mt-2">
                {activeView === 'deals' && 'Ranked investment opportunities with scoring'}
                {activeView === 'map' && 'Geographic visualization of market data'}
                {activeView === 'underwrite' && 'Quick investment analysis calculator'}
              </p>
            </div>
            
            {views[activeView].component}
          </main>
        </div>
      </div>
    </>
  )
}
