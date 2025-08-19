import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'
import { getApiBaseUrl } from '../lib/api'

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

function DealsPageContent() {
  const [deals, setDeals] = useState<DealMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<DealMetrics | null>(null)
  const [filters, setFilters] = useState({
    state: '',
    minRentIndex: '',
    minPermits: '',
    hideNA: false
  })
  const [sortConfig, setSortConfig] = useState({
    field: 'permit_count' as keyof DealMetrics,
    direction: 'desc' as 'asc' | 'desc'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchDeals()
    }
  }, [mounted])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/deals?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_email')
        window.location.href = '/login'
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setDeals(data.deals)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals')
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: keyof DealMetrics) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredAndSortedDeals = () => {
    let filtered = [...deals]

    // Apply filters
    if (filters.state) {
      filtered = filtered.filter(deal => deal.state === filters.state)
    }
    if (filters.minRentIndex) {
      filtered = filtered.filter(deal => deal.rent_index && deal.rent_index >= parseFloat(filters.minRentIndex))
    }
    if (filters.minPermits) {
      filtered = filtered.filter(deal => deal.permit_count >= parseInt(filters.minPermits))
    }
    if (filters.hideNA) {
      filtered = filtered.filter(deal => 
        deal.rent_index !== null && 
        deal.home_value_index !== null && 
        deal.income !== null && 
        deal.population !== null
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]
      
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    return filtered
  }

  const getScenarioScore = (deal: DealMetrics): { scenario: string; score: number; color: string } => {
    // Simple scoring logic - in production this would be more sophisticated
    let score = 0
    let factors: string[] = []
    
    // Base score from permit activity
    if (deal.permit_count >= 20) {
      score += 30
      factors.push('High permit activity')
    } else if (deal.permit_count >= 10) {
      score += 20
      factors.push('Moderate permit activity')
    } else if (deal.permit_count >= 5) {
      score += 10
      factors.push('Some permit activity')
    }
    
    // Rent growth bonus
    if (deal.rent_growth && deal.rent_growth > 5) {
      score += 25
      factors.push('Strong rent growth')
    } else if (deal.rent_growth && deal.rent_growth > 0) {
      score += 15
      factors.push('Positive rent growth')
    }
    
    // Value growth bonus
    if (deal.value_growth && deal.value_growth > 5) {
      score += 20
      factors.push('Strong value growth')
    } else if (deal.value_growth && deal.value_growth > 0) {
      score += 10
      factors.push('Positive value growth')
    }
    
    // News buzz bonus
    if (deal.news_count && deal.news_count >= 10) {
      score += 15
      factors.push('High news buzz')
    } else if (deal.news_count && deal.news_count >= 5) {
      score += 10
      factors.push('Moderate news buzz')
    }
    
    // Flood risk penalty
    if (deal.flood_flag) {
      score -= 20
      factors.push('Flood risk penalty')
    }
    
    // Determine scenario
    let scenario = 'S3'
    if (score >= 70) scenario = 'S1'
    else if (score >= 50) scenario = 'S2'
    
    // Determine color
    let color = 'bg-gray-100 text-gray-800'
    if (scenario === 'S1') color = 'bg-green-100 text-green-800'
    else if (scenario === 'S2') color = 'bg-yellow-100 text-yellow-800'
    else color = 'bg-red-100 text-red-800'
    
    return { scenario, score, color }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deals data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Deals</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDeals}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const processedDeals = filteredAndSortedDeals()

  return (
    <>
      <Head>
        <title>Investment Deals - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Investment Opportunities
            </h1>
            <p className="text-gray-600">
              Scored deals across NJ/PA with market metrics, permit activity, and risk assessment
            </p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All States</option>
                    <option value="NJ">New Jersey</option>
                    <option value="PA">Pennsylvania</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Rent Index
                  </label>
                  <input
                    type="number"
                    value={filters.minRentIndex}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRentIndex: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-24"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Permits
                  </label>
                  <input
                    type="number"
                    value={filters.minPermits}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPermits: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-24"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hideNA"
                    checked={filters.hideNA}
                    onChange={(e) => setFilters(prev => ({ ...prev, hideNA: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hideNA" className="ml-2 text-sm text-gray-700">
                    Hide N/A values
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing {processedDeals.length} of {deals.length} deals
                </div>
                <button
                  onClick={fetchDeals}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Table */}
            <div className="lg:col-span-3">
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('zip_code')}>
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('permit_count')}>
                          Permits (12mo)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rent_index')}>
                          Rent Index
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rent_growth')}>
                          Rent Growth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('home_value_index')}>
                          Home Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('value_growth')}>
                          Value Growth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scenario
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processedDeals.map((deal) => {
                        const scenario = getScenarioScore(deal)
                        return (
                          <tr 
                            key={deal.zip_code}
                            className={`hover:bg-gray-50 cursor-pointer ${selectedDeal?.zip_code === deal.zip_code ? 'bg-primary-50' : ''}`}
                            onClick={() => setSelectedDeal(selectedDeal?.zip_code === deal.zip_code ? null : deal)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{deal.zip_code}</div>
                                <div className="text-sm text-gray-500">{deal.city}, {deal.state}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deal.permit_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deal.rent_index ? `$${deal.rent_index.toLocaleString()}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {deal.rent_growth ? (
                                <span className={deal.rent_growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {deal.rent_growth > 0 ? '+' : ''}{deal.rent_growth.toFixed(1)}%
                                </span>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deal.home_value_index ? `$${deal.home_value_index.toLocaleString()}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {deal.value_growth ? (
                                <span className={deal.value_growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {deal.value_growth > 0 ? '+' : ''}{deal.value_growth.toFixed(1)}%
                                </span>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scenario.color}`}>
                                {scenario.scenario} ({scenario.score})
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card">
                {selectedDeal ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📍 {selectedDeal.zip_code} Details
                    </h3>
                    
                    {(() => {
                      const scenario = getScenarioScore(selectedDeal)
                      return (
                        <div className="space-y-4">
                          {/* Scenario Score */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Scenario Score</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Scenario:</span>
                                <span className={`font-medium px-2 py-1 rounded text-xs ${scenario.color}`}>
                                  {scenario.scenario}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="font-medium">{scenario.score}/100</span>
                              </div>
                            </div>
                          </div>

                          {/* Location Info */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                            <p className="text-sm text-gray-600">
                              {selectedDeal.city}, {selectedDeal.state}
                            </p>
                            <p className="text-sm text-gray-500">{selectedDeal.zip_code}</p>
                          </div>

                          {/* Market Metrics */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Market Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rent Index:</span>
                                <span className="font-medium">
                                  {selectedDeal.rent_index ? `$${selectedDeal.rent_index.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Home Value:</span>
                                <span className="font-medium">
                                  {selectedDeal.home_value_index ? `$${selectedDeal.home_value_index.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Permits (12mo):</span>
                                <span className="font-medium">{selectedDeal.permit_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rent Growth:</span>
                                <span className={`font-medium ${
                                  selectedDeal.rent_growth && selectedDeal.rent_growth > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {selectedDeal.rent_growth ? `${selectedDeal.rent_growth > 0 ? '+' : ''}${selectedDeal.rent_growth.toFixed(1)}%` : 'N/A'}
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
                                  selectedDeal.flood_flag ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {selectedDeal.flood_flag ? '⚠️ HIGH' : '✅ LOW'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">News Buzz:</span>
                                <span className="font-medium">
                                  {selectedDeal.news_count || 0} articles
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
                                  {selectedDeal.income ? `$${selectedDeal.income.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Population:</span>
                                <span className="font-medium">
                                  {selectedDeal.population ? selectedDeal.population.toLocaleString() : 'N/A'}
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
                    <div className="text-gray-400 text-4xl mb-2">📊</div>
                    <p className="text-gray-600">
                      Click on a deal to see detailed metrics and scoring breakdown
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">S1 - Prime Opportunities</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">S1</span>
                      <span>Score 70+ (High permits, strong growth)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">S2 - Good Potential</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">S2</span>
                      <span>Score 50-69 (Moderate activity, some growth)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">S3 - Monitor</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">S3</span>
                      <span>Score &lt;50 (Low activity, limited growth)</span>
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

export default function DealsPage() {
  return (
    <ProtectedRoute>
      <DealsPageContent />
    </ProtectedRoute>
  )
}
