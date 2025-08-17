import { useState } from 'react'

interface MapData {
  zipCode: string
  location: string
  state: 'NJ' | 'PA'
  rentGrowth: number
  permitActivity: number
  newsBuzz: number
  coordinates: [number, number]
}

// Mock data for demonstration
const mockMapData: MapData[] = [
  { zipCode: '07302', location: 'Jersey City', state: 'NJ', rentGrowth: 12.5, permitActivity: 8, newsBuzz: 7, coordinates: [40.7178, -74.0431] },
  { zipCode: '19123', location: 'Philadelphia', state: 'PA', rentGrowth: 8.2, permitActivity: 12, newsBuzz: 9, coordinates: [39.9526, -75.1652] },
  { zipCode: '07102', location: 'Newark', state: 'NJ', rentGrowth: 15.3, permitActivity: 15, newsBuzz: 11, coordinates: [40.7357, -74.1724] },
  { zipCode: '08540', location: 'Princeton', state: 'NJ', rentGrowth: 6.8, permitActivity: 5, newsBuzz: 4, coordinates: [40.3573, -74.6672] },
  { zipCode: '19147', location: 'South Philly', state: 'PA', rentGrowth: 11.2, permitActivity: 9, newsBuzz: 8, coordinates: [39.9300, -75.1600] }
]

export default function MapView() {
  const [selectedLayer, setSelectedLayer] = useState<'rent' | 'permits' | 'news'>('rent')
  const [selectedZip, setSelectedZip] = useState<string | null>(null)

  const getHeatmapColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue
    if (intensity > 0.8) return 'bg-red-500'
    if (intensity > 0.6) return 'bg-orange-500'
    if (intensity > 0.4) return 'bg-yellow-500'
    if (intensity > 0.2) return 'bg-blue-500'
    return 'bg-gray-400'
  }

  const getMaxValue = () => {
    switch (selectedLayer) {
      case 'rent': return Math.max(...mockMapData.map(d => d.rentGrowth))
      case 'permits': return Math.max(...mockMapData.map(d => d.permitActivity))
      case 'news': return Math.max(...mockMapData.map(d => d.newsBuzz))
      default: return 100
    }
  }

  const getLayerValue = (data: MapData) => {
    switch (selectedLayer) {
      case 'rent': return data.rentGrowth
      case 'permits': return data.permitActivity
      case 'news': return data.newsBuzz
      default: return 0
    }
  }

  const getLayerIcon = () => {
    switch (selectedLayer) {
      case 'rent': return <span className="text-lg">💰</span>
      case 'permits': return <span className="text-lg">🏗️</span>
      case 'news': return <span className="text-lg">📰</span>
      default: return <span className="text-lg">📊</span>
    }
  }

  const getLayerLabel = () => {
    switch (selectedLayer) {
      case 'rent': return 'Rent Growth (%)'
      case 'permits': return 'Permit Activity'
      case 'news': return 'News Buzz Score'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Layer Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Map Visualization</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Data Layer:</span>
            <select 
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="rent">Rent Growth</option>
              <option value="permits">Permit Activity</option>
              <option value="news">News Buzz</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-realestate-rent-growth rounded-lg">
                <span className="text-white text-lg">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rent Growth</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(mockMapData.reduce((sum, d) => sum + d.rentGrowth, 0) / mockMapData.length)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-realestate-permit-activity rounded-lg">
                <span className="text-white text-lg">🏗️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Permit Activity</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(mockMapData.reduce((sum, d) => sum + d.permitActivity, 0) / mockMapData.length)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-realestate-news-buzz rounded-lg">
                <span className="text-white text-lg">📰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">News Buzz</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(mockMapData.reduce((sum, d) => sum + d.newsBuzz, 0) / mockMapData.length)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getLayerLabel()} Heatmap
          </h3>
          <p className="text-sm text-gray-600">
            Click on a location to view detailed metrics
          </p>
        </div>

        {/* Placeholder Map - Will be replaced with actual Leaflet map */}
        <div className="relative bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl text-gray-400 mb-4">📍</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This will show a Leaflet map with heatmaps of {selectedLayer === 'rent' ? 'rent growth' : selectedLayer === 'permits' ? 'permit activity' : 'news buzz'} across NJ/PA
            </p>
            
            {/* Data Points Preview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-2xl mx-auto">
              {mockMapData.map((data) => {
                const value = getLayerValue(data)
                const maxValue = getMaxValue()
                return (
                  <div
                    key={data.zipCode}
                    onClick={() => setSelectedZip(selectedZip === data.zipCode ? null : data.zipCode)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all duration-200 text-center
                      ${selectedZip === data.zipCode ? 'ring-2 ring-primary-500' : ''}
                      ${getHeatmapColor(value, maxValue)}
                    `}
                  >
                    <div className="text-white font-medium text-sm">{data.zipCode}</div>
                    <div className="text-white text-xs opacity-90">{value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedZip && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
            {(() => {
              const data = mockMapData.find(d => d.zipCode === selectedZip)
              if (!data) return null
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{data.location}, {data.state}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rent Growth:</span>
                    <span className="ml-2 font-medium">{data.rentGrowth}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Permit Activity:</span>
                    <span className="ml-2 font-medium">{data.permitActivity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">News Buzz:</span>
                    <span className="ml-2 font-medium">{data.newsBuzz}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coordinates:</span>
                    <span className="ml-2 font-medium">{data.coordinates[0].toFixed(4)}, {data.coordinates[1].toFixed(4)}</span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Heatmap Legend</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>High ({Math.round(getMaxValue() * 0.8)}+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Medium-High ({Math.round(getMaxValue() * 0.6)}+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium ({Math.round(getMaxValue() * 0.4)}+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Low ({Math.round(getMaxValue() * 0.2)}+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Very Low (&lt;{Math.round(getMaxValue() * 0.2)})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
