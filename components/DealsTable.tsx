import { useState } from 'react'

interface Deal {
  id: string
  location: string
  zipCode: string
  state: 'NJ' | 'PA'
  scenario: 'High Rent + Underperforming' | 'Low Price + Flip Potential' | 'Up & Coming'
  score: number
  rentGrowth: number
  permitActivity: number
  newsBuzz: number
  floodRisk: 'Low' | 'Medium' | 'High'
  lastUpdated: string
  description: string
}

// Mock data for demonstration
const mockDeals: Deal[] = [
  {
    id: '1',
    location: 'Jersey City',
    zipCode: '07302',
    state: 'NJ',
    scenario: 'High Rent + Underperforming',
    score: 87,
    rentGrowth: 12.5,
    permitActivity: 8,
    newsBuzz: 7,
    floodRisk: 'Low',
    lastUpdated: '2024-01-15',
    description: 'High rental demand area with properties below market value'
  },
  {
    id: '2',
    location: 'Philadelphia',
    zipCode: '19123',
    state: 'PA',
    scenario: 'Low Price + Flip Potential',
    score: 82,
    rentGrowth: 8.2,
    permitActivity: 12,
    newsBuzz: 9,
    floodRisk: 'Medium',
    lastUpdated: '2024-01-14',
    description: 'Gentrifying neighborhood with renovation opportunities'
  },
  {
    id: '3',
    location: 'Newark',
    zipCode: '07102',
    state: 'NJ',
    scenario: 'Up & Coming',
    score: 79,
    rentGrowth: 15.3,
    permitActivity: 15,
    newsBuzz: 11,
    floodRisk: 'Low',
    lastUpdated: '2024-01-13',
    description: 'Rapid development with increasing property values'
  }
]

export default function DealsTable() {
  const [deals] = useState<Deal[]>(mockDeals)
  const [sortField, setSortField] = useState<keyof Deal>('score')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFloodRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'status-high'
      case 'Medium': return 'status-medium'
      case 'High': return 'status-low'
      default: return 'status-medium'
    }
  }

  const getScenarioColor = (scenario: string) => {
    if (scenario.includes('High Rent')) return 'bg-blue-100 text-blue-800'
    if (scenario.includes('Low Price')) return 'bg-green-100 text-green-800'
    return 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-2 bg-realestate-investment-score rounded-lg">
              <span className="text-white text-lg">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
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
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(deals.reduce((sum, deal) => sum + deal.score, 0) / deals.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center">
            <div className="p-2 bg-realestate-permit-activity rounded-lg">
              <span className="text-white text-lg">📍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NJ Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.state === 'NJ').length}
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
              <p className="text-sm font-medium text-gray-600">PA Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.state === 'PA').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Investment Opportunities</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select 
              value={sortField}
              onChange={(e) => handleSort(e.target.value as keyof Deal)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="score">Score</option>
              <option value="rentGrowth">Rent Growth</option>
              <option value="permitActivity">Permit Activity</option>
              <option value="newsBuzz">News Buzz</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.location}</div>
                      <div className="text-sm text-gray-500">{deal.zipCode}, {deal.state}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScenarioColor(deal.scenario)}`}>
                      {deal.scenario}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getScoreColor(deal.score)}`}>
                      {deal.score}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Rent:</span>
                        <span className="font-medium">{deal.rentGrowth}%</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Permits:</span>
                        <span className="font-medium">{deal.permitActivity}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">News:</span>
                        <span className="font-medium">{deal.newsBuzz}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${getFloodRiskColor(deal.floodRisk)}`}>
                      {deal.floodRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deal.lastUpdated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
