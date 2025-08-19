import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'
import { getApiBaseUrl } from '../lib/api'

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

interface NewsSummary {
  counties: Array<{
    county: string
    state: string
    article_count: number
    avg_sentiment: number
    avg_relevance: number
  }>
  total_articles: number
  period_days: number
}

function NewsPageContent() {
  const [newsSummary, setNewsSummary] = useState<NewsSummary | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daysFilter, setDaysFilter] = useState<number>(14)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchNewsSummary()
    }
  }, [mounted])

  useEffect(() => {
    if (selectedCounty) {
      fetchNewsForCounty(selectedCounty, daysFilter)
    }
  }, [selectedCounty, daysFilter])

  const fetchNewsSummary = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/news/summary`, {
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
      setNewsSummary(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news summary')
      console.error('Error fetching news summary:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsForCounty = async (county: string, days: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/news?county=${encodeURIComponent(county)}&days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      }
    } catch (err) {
      console.error('Error fetching county news:', err)
    }
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600'
    if (score < -0.3) return 'text-red-600'
    return 'text-gray-600'
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return '📈'
    if (score < -0.3) return '📉'
    return '➡️'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading news data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading News</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchNewsSummary}
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
        <title>News Pulse - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📰 Development News Pulse
            </h1>
            <p className="text-gray-600">
              Track development buzz and redevelopment activity across NJ/PA counties
            </p>
          </div>

          {/* Controls */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Time Period:
                </label>
                <select
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {newsSummary ? `${newsSummary.total_articles} total articles` : 'Loading...'}
                </div>
                <button
                  onClick={fetchNewsSummary}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* County Overview Grid */}
          {newsSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {newsSummary.counties.map((county) => (
                <div
                  key={`${county.county}-${county.state}`}
                  className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCounty === county.county ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedCounty(selectedCounty === county.county ? null : county.county)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {county.county}
                    </h3>
                    <span className="text-sm text-gray-500">{county.state}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Articles:</span>
                      <span className="font-medium text-lg">{county.article_count}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sentiment:</span>
                      <span className={`font-medium ${getSentimentColor(county.avg_sentiment)}`}>
                        {getSentimentIcon(county.avg_sentiment)} {county.avg_sentiment.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Relevance:</span>
                      <span className="font-medium">{county.avg_relevance.toFixed(1)}/5</span>
                    </div>
                  </div>
                  
                  {selectedCounty === county.county && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-primary-600 font-medium">
                        ✓ Selected - Viewing articles below
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Articles for Selected County */}
          {selectedCounty && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  📍 {selectedCounty} News Headlines
                </h2>
                <button
                  onClick={() => setSelectedCounty(null)}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
              
              {articles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📰</div>
                  <p className="text-gray-600">No articles found for {selectedCounty} in the last {daysFilter} days</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span>📅 {formatDate(article.published_at)}</span>
                            {article.source && <span>📰 {article.source}</span>}
                            {article.city && <span>📍 {article.city}</span>}
                          </div>
                          
                          {article.keywords && article.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {article.keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`flex items-center ${getSentimentColor(article.sentiment_score || 0)}`}>
                              {getSentimentIcon(article.sentiment_score || 0)} 
                              Sentiment: {(article.sentiment_score || 0).toFixed(2)}
                            </span>
                            <span className="text-gray-600">
                              Relevance: {article.relevance_score || 0}/5
                            </span>
                          </div>
                        </div>
                        
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            Read More →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!selectedCounty && (
            <div className="card">
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a County</h3>
                <p className="text-gray-600">
                  Click on any county card above to view the latest development news and headlines
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function NewsPage() {
  return (
    <ProtectedRoute>
      <NewsPageContent />
    </ProtectedRoute>
  )
}
