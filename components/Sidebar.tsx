interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeView: string
  onViewChange: (view: 'deals' | 'map' | 'underwrite') => void
}

const navigation = [
  {
    id: 'deals',
    name: 'Deals Table',
    description: 'Ranked investment opportunities',
    icon: '📊',
    status: 'active',
    color: 'text-realestate-investment-score'
  },
  {
    id: 'map',
    name: 'Map View',
    description: 'Geographic market visualization',
    icon: '🗺️',
    status: 'active',
    color: 'text-realestate-permit-activity'
  },
  {
    id: 'underwrite',
    name: 'Underwrite Form',
    description: 'Investment analysis calculator',
    icon: '🧮',
    status: 'active',
    color: 'text-realestate-rent-growth'
  }
]

const features = [
  { name: 'Permits Ingest', status: 'pending', description: 'NJ & Philly permit data' },
  { name: 'Zillow Indices', status: 'pending', description: 'Market trend analysis' },
  { name: 'Flood Risk', status: 'pending', description: 'FEMA data integration' },
  { name: 'News Pulse', status: 'pending', description: 'Local development news' },
  { name: 'Investment Scoring', status: 'pending', description: 'Deal evaluation system' }
]

export default function Sidebar({ isOpen, onClose, activeView, onViewChange }: SidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <nav className="mt-6 px-6">
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${activeView === item.id
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className={`mr-3 text-lg ${item.color}`}>{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>
        
        <div className="mt-8 px-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Feature Status</h3>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </div>
                <span className={`status-badge ${getStatusColor(feature.status)}`}>
                  {feature.status === 'active' ? '✓' : feature.status === 'pending' ? '⏳' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
