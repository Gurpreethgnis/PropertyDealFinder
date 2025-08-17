import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'

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
}

interface DealsResponse {
  deals: DealMetrics[]
  total: number
  state: string
}

function DealsPageContent() {
  const [deals, setDeals] = useState<DealMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('rent_growth')
  const [stateFilter, setStateFilter] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchDeals()
    }
  }, [mounted, sortBy, stateFilter])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        sort_by: sortBy,
        limit: '100'
      })
      
      if (stateFilter) {
        params.append('state', stateFilter)
      }

      // Get the JWT token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      // Use environment variable or fallback to localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/deals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_email')
        window.location.href = '/login'
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DealsResponse = await response.json()
      setDeals(data.deals)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals')
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number | null) => {
    if (value === null) return 'N/A'
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A'
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number | null) => {
    if (value === null) return 'text-gray-500'
    if (value > 5) return 'text-green-600'
    if (value > 0) return 'text-blue-600'
    return 'text-red-600'
  }

  // Don't render until mounted to prevent hydration mismatch
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

  return (
    <>
      <Head>
        <title>Deals - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎯 Investment Deals Analysis
            </h1>
            <p className="text-gray-600">
              ZIP-level metrics for real estate investment opportunities
            </p>
          </div>

          {/* Controls */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="rent_growth">Rent Growth</option>
                  <option value="permit_count">Permit Count</option>
                  <option value="rent_index">Rent Index</option>
                  <option value="value_growth">Value Growth</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  State:
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All States</option>
                  <option value="NJ">New Jersey</option>
                  <option value="PA">Pennsylvania</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-investment-score rounded-lg">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Areas</p>
                  <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-rent-growth rounded-lg">
                  <span className="text-white text-lg">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rent Growth</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.length > 0 
                      ? formatPercentage(deals.reduce((sum, d) => sum + (d.rent_growth || 0), 0) / deals.length)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-permit-activity rounded-lg">
                  <span className="text-white text-lg">🏗️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permits</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {deals.reduce((sum, d) => sum + d.permit_count, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-news-buzz rounded-lg">
                  <span className="text-white text-lg">📍</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">States</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(deals.map(d => d.state)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rent Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Home Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth (12mo)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demographics
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deals.map((deal, index) => (
                    <tr key={deal.zip_code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {deal.city}, {deal.state}
                          </div>
                          <div className="text-sm text-gray-500">{deal.zip_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(deal.rent_index)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(deal.home_value_index)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className={`text-sm font-medium ${getGrowthColor(deal.rent_growth)}`}>
                            Rent: {formatPercentage(deal.rent_growth)}
                          </div>
                          <div className={`text-sm font-medium ${getGrowthColor(deal.value_growth)}`}>
                            Value: {formatPercentage(deal.value_growth)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {deal.permit_count}
                        </div>
                        <div className="text-xs text-gray-500">past 12 months</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500">Income:</span>
                            <span className="ml-2 font-medium">{formatCurrency(deal.income)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-sm text-gray-500">Pop:</span>
                            <span className="ml-2 font-medium">{formatNumber(deal.population)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Data refreshed from FastAPI backend • {mounted && new Date().toLocaleString()}</p>
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
