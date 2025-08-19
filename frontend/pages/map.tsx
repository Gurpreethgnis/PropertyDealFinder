import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'
import { getApiBaseUrl } from '../lib/api'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface DealMetrics {
  zip_code: string
  city: string
  state: string
  rent_index: number | null
  home_value_index: number | null
  permit_count: number
  income: number | null
  population: number | null
  rent_growth: number | null
  value_growth: number | null
  flood_flag: boolean | null
  news_count: number | null
}

interface NewsArticle {
  id: number
  title: string
  source: string | null
  url: string | null
  published_at: string | null
  city: string | null
  state: string | null
  county: string | null
  zip_code: string | null
  keywords: string[] | null
  sentiment_score: number | null
  relevance_score: number | null
}

function MapPageContent() {
  const [deals, setDeals] = useState<DealMetrics[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedZip, setSelectedZip] = useState<string | null>(null)
  const [mapLayer, setMapLayer] = useState<'permits' | 'rent_growth' | 'flood_risk'>('permits')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchData()
    }
  }, [mounted])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get the JWT token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const apiUrl = getApiBaseUrl()
      
      // Fetch deals data
      const dealsResponse = await fetch(`${apiUrl}/api/deals?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (dealsResponse.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_email')
        window.location.href = '/login'
        return
      }
      
      if (!dealsResponse.ok) {
        throw new Error(`HTTP error! status: ${dealsResponse.status}`)
      }
      
      const dealsData = await dealsResponse.json()
      setDeals(dealsData.deals)
      
      // Fetch news summary
      const newsResponse = await fetch(`${apiUrl}/api/news/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        // For now, we'll use a simplified news structure
        // In a real implementation, you'd fetch detailed news by ZIP
        setNews([])
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedZipData = () => {
    if (!selectedZip) return null
    return deals.find(deal => deal.zip_code === selectedZip)
  }

  const getSelectedZipNews = () => {
    if (!selectedZip) return []
    // In a real implementation, you'd fetch news for the specific ZIP
    return news.filter(article => article.zip_code === selectedZip)
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Map</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Interactive Map - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🗺️ Interactive Property Hotspots Map
            </h1>
            <p className="text-gray-600">
              Visualize investment opportunities, flood risk, and development buzz across NJ/PA
            </p>
          </div>

          {/* Map Controls */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Map Layer:
                </label>
                <select
                  value={mapLayer}
                  onChange={(e) => setMapLayer(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="permits">Permit Activity (12mo)</option>
                  <option value="rent_growth">Rent Growth (%)</option>
                  <option value="flood_risk">Flood Risk Zones</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing {deals.length} areas
                </div>
                <button
                  onClick={fetchData}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Map */}
            <div className="lg:col-span-3">
              <div className="card p-0 overflow-hidden">
                <MapView
                  deals={deals}
                  mapLayer={mapLayer}
                  onZipSelect={setSelectedZip}
                  selectedZip={selectedZip}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card">
                {selectedZip ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📍 {selectedZip} Details
                    </h3>
                    
                    {(() => {
                      const zipData = getSelectedZipData()
                      if (!zipData) return null
                      
                      return (
                        <div className="space-y-4">
                          {/* Location Info */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                            <p className="text-sm text-gray-600">
                              {zipData.city}, {zipData.state}
                            </p>
                            <p className="text-sm text-gray-500">{zipData.zip_code}</p>
                          </div>

                          {/* Market Metrics */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Market Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rent Index:</span>
                                <span className="font-medium">
                                  {zipData.rent_index ? `$${zipData.rent_index.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Home Value:</span>
                                <span className="font-medium">
                                  {zipData.home_value_index ? `$${zipData.home_value_index.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Permits (12mo):</span>
                                <span className="font-medium">{zipData.permit_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rent Growth:</span>
                                <span className={`font-medium ${
                                  zipData.rent_growth && zipData.rent_growth > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {zipData.rent_growth ? `${zipData.rent_growth > 0 ? '+' : ''}${zipData.rent_growth.toFixed(1)}%` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Risk & Buzz */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Risk & Buzz</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Flood Risk:</span>
                                <span className={`font-medium ${
                                  zipData.flood_flag ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {zipData.flood_flag ? '⚠️ HIGH' : '✅ LOW'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">News Buzz:</span>
                                <span className="font-medium">
                                  {zipData.news_count || 0} articles
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Demographics */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Income:</span>
                                <span className="font-medium">
                                  {zipData.income ? `$${zipData.income.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Population:</span>
                                <span className="font-medium">
                                  {zipData.population ? zipData.population.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🗺️</div>
                    <p className="text-gray-600">
                      Click on a ZIP code on the map to see detailed information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Permit Activity</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span>High (20+ permits)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Medium (5-19 permits)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span>Low (0-4 permits)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Flood Risk</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                      <span>High Risk (FEMA Zone A/AE)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                      <span>Low Risk (FEMA Zone X)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">News Buzz</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span>High Buzz (10+ articles)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-300 rounded-full mr-2"></div>
                      <span>Medium Buzz (3-9 articles)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 rounded-full mr-2"></div>
                      <span>Low Buzz (0-2 articles)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapPageContent />
    </ProtectedRoute>
  )
}
