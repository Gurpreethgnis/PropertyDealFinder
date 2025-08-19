import Link from 'next/link'
import { useRouter } from 'next/router'

const Navigation = () => {
  const router = useRouter()
  
  // Hide navigation on public pages
  const publicPages = ['/', '/login']
  if (publicPages.includes(router.pathname)) {
    return null
  }
  
  const navItems = [
    {
      name: 'Deals',
      href: '/deals',
      icon: '📊',
      description: 'Deals'
    },
    {
      name: 'Map',
      href: '/map',
      icon: '🗺️',
      description: 'Map'
    },
    {
      name: 'News',
      href: '/news',
      icon: '📰',
      description: 'News'
    },
    {
      name: 'Underwrite',
      href: '/underwrite',
      icon: '🧮',
      description: 'Calculator'
    }
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
                     {/* Logo and Brand */}
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <h1 className="text-xl font-bold text-gray-900">
                 🏡 PropertyFinder
               </h1>
             </div>
           </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group relative flex flex-col items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive(item.href)
                      ? 'text-primary-700 bg-primary-50 border-2 border-primary-200 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-25 border-2 border-transparent hover:border-primary-100'
                    }
                  `}
                >
                  <span className="text-xl mb-2 transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                  <span className="font-semibold text-base">{item.name}</span>
                  <span className="text-xs text-gray-500 group-hover:text-primary-500 mt-1">
                    {item.description}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

                     {/* User Info and Logout */}
           <div className="flex items-center space-x-3">
             <span className="text-sm text-gray-600">
               Welcome, {typeof window !== 'undefined' ? localStorage.getItem('user_email') || 'User' : 'User'}
             </span>
             <button
               onClick={() => {
                 localStorage.removeItem('auth_token')
                 localStorage.removeItem('user_email')
                 window.location.href = '/login'
               }}
               className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
             >
               Logout
             </button>
           </div>
        </div>
      </div>

              {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                  ${isActive(item.href)
                    ? 'text-primary-700 bg-primary-50 border-2 border-primary-200 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-25 border-2 border-transparent hover:border-primary-100'
                  }
                `}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-4">{item.icon}</span>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
    </nav>
  )
}

export default Navigation
