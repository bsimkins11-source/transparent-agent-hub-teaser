import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  CubeIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

// Function to determine text color based on background brightness
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Validate hex color
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return '#ffffff' // Default to white for invalid colors
  }
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate brightness using YIQ formula
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  
  // Return black for light backgrounds, white for dark backgrounds
  // Use a lower threshold to favor white text for better readability
  return yiq >= 140 ? '#000000' : '#ffffff'
}

// Mock company data - in production this would come from your backend
// These colors should match the actual company branding colors set when companies were added
const companies = [
  {
    id: 'transparent-partners',
    name: 'Transparent Partners',
    domain: 'transparent.partners',
    logo: '/transparent-partners-logo.png',
    userCount: 22,
    agentCount: 15,
    networkCount: 4,
    description: 'AI consulting and implementation services - Your Partner, Not a Vendor',
    status: 'active',
    primaryColor: '#8B5CF6', // Transparent Partners purple primary
    secondaryColor: '#7C3AED', // Transparent Partners purple secondary
    networks: [
      { id: 'leadership', name: 'Leadership Team', userCount: 6 },
      { id: 'ai-solutions', name: 'AI Solutions', userCount: 8 },
      { id: 'client-services', name: 'Client Services', userCount: 12 },
      { id: 'analytics', name: 'Analytics & Insights', userCount: 9 }
    ]
  },
  {
    id: 'acme-corp',
    name: 'Acme Corporation',
    domain: 'acme.com',
    logo: 'https://logo.clearbit.com/acme.com',
    userCount: 156,
    agentCount: 24,
    networkCount: 5,
    description: 'Global manufacturing and logistics',
    status: 'active',
    primaryColor: '#ef4444', // Red primary (lightened)
    secondaryColor: '#f87171', // Red secondary (lightened)
    networks: [
      { id: 'north-america', name: 'North America', userCount: 78 },
      { id: 'europe', name: 'Europe', userCount: 45 },
      { id: 'asia-pacific', name: 'Asia Pacific', userCount: 33 }
    ]
  },
  {
    id: 'global-tech',
    name: 'Global Tech Solutions',
    domain: 'globaltech.io',
    logo: 'https://logo.clearbit.com/globaltech.io',
    userCount: 89,
    agentCount: 18,
    networkCount: 4,
    description: 'Enterprise software solutions',
    status: 'active',
    primaryColor: '#2563eb', // Blue primary
    secondaryColor: '#1d4ed8', // Darker blue secondary
    networks: [
      { id: 'engineering', name: 'Engineering', userCount: 45 },
      { id: 'sales', name: 'Sales & Marketing', userCount: 28 },
      { id: 'support', name: 'Customer Support', userCount: 16 }
    ]
  },
  {
    id: 'startup-inc',
    name: 'Startup Inc',
    domain: 'startup.inc',
    logo: 'https://logo.clearbit.com/startup.inc',
    userCount: 23,
    agentCount: 6,
    networkCount: 2,
    description: 'Innovative fintech solutions',
    status: 'active',
    primaryColor: '#7c3aed', // Purple primary
    secondaryColor: '#6d28d9', // Darker purple secondary
    networks: [
      { id: 'product', name: 'Product Team', userCount: 15 },
      { id: 'operations', name: 'Operations', userCount: 8 }
    ]
  }
]

export default function CompanySelectionPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Company Administration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a company to manage its settings, users, agents, and networks. 
            As a Super Admin, you have access to all company administration dashboards.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 text-center">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
            <div className="text-sm text-gray-600">Total Companies</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 text-center">
            <UserGroupIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {companies.reduce((sum, company) => sum + company.userCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 text-center">
            <CubeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {companies.reduce((sum, company) => sum + company.agentCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Agents</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 text-center">
            <ChartBarIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {companies.reduce((sum, company) => sum + company.networkCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Networks</div>
          </div>
        </motion.div>

        {/* Companies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
            <div className="text-sm text-gray-500">
              {companies.filter(c => c.status === 'active').length} active companies
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                style={{
                  borderColor: company.primaryColor + '20',
                  borderWidth: '1px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = company.primaryColor + '40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = company.primaryColor + '20';
                }}
              >
                {/* Company Header */}
                <div 
                  className="h-20 relative"
                  style={{ 
                    background: company.secondaryColor 
                      ? `linear-gradient(135deg, ${company.primaryColor}ee, ${company.secondaryColor}cc)`
                      : `linear-gradient(135deg, ${company.primaryColor}ee, ${company.primaryColor}cc)`
                  }}
                >
                  <div className="relative h-full flex items-center justify-center">
                    <div 
                      className={`font-semibold text-lg company-tile-text ${getContrastColor(company.primaryColor) === '#ffffff' ? '' : 'light'}`}
                      style={{ 
                        color: getContrastColor(company.primaryColor) 
                      }}
                    >
                      {company.name}
                    </div>
                  </div>
                </div>

                {/* Company Content */}
                <div 
                  className="p-6"
                  style={{
                    background: company.secondaryColor 
                      ? `linear-gradient(135deg, ${company.primaryColor}ee, ${company.secondaryColor}cc)`
                      : `linear-gradient(135deg, ${company.primaryColor}ee, ${company.primaryColor}cc)`
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={`${company.name} logo`}
                            className="w-32 h-20 rounded-xl object-cover border-2 border-white shadow-xl"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-32 h-20 rounded-xl flex items-center justify-center text-2xl font-bold border-2 border-white shadow-xl company-tile-text ${getContrastColor(company.primaryColor) === '#ffffff' ? '' : 'light'}`}
                          style={{ 
                            background: company.secondaryColor 
                              ? `linear-gradient(135deg, ${company.primaryColor}, ${company.secondaryColor})`
                              : company.primaryColor,
                            color: getContrastColor(company.primaryColor),
                            display: company.logo ? 'none' : 'flex' 
                          }}
                        >
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{company.name}</h3>
                          <p className="text-sm text-white/80">{company.domain}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/90 text-sm mb-4">{company.description}</p>
                    
                    {/* Company Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{company.userCount}</div>
                        <div className="text-xs text-white/80">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{company.agentCount}</div>
                        <div className="text-xs text-white/80">Agents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{company.networkCount}</div>
                        <div className="text-xs text-white/80">Networks</div>
                      </div>
                    </div>

                    {/* Networks Preview */}
                    <div className="mb-6">
                      <div className="text-xs font-medium text-white mb-2">Networks:</div>
                      <div className="flex flex-wrap gap-2">
                        {company.networks.slice(0, 3).map((network) => (
                          <div 
                            key={network.id}
                            className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm"
                          >
                            {network.name}
                          </div>
                        ))}
                        {company.networks.length > 3 && (
                          <div className="px-2 py-1 bg-white/30 text-white text-xs rounded-full backdrop-blur-sm">
                            +{company.networks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/admin/company/${company.id}`}
                      className="w-full bg-white/20 backdrop-blur-sm text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:bg-white/30 hover:shadow-xl hover:scale-105 group company-admin-button border border-white/30"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <BuildingOfficeIcon className="w-5 h-5" />
                      <span>Go to Company Admin Page</span>
                      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-soft border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/super-admin"
              className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👑</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Super Admin Dashboard</div>
                <div className="text-sm text-gray-600">Global system management</div>
              </div>
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🔄</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Refresh Companies</div>
                <div className="text-sm text-gray-600">Update company data</div>
              </div>
            </button>
            
            <Link
              to="/agents"
              className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Global Agent Library</div>
                <div className="text-sm text-gray-600">Browse all agents</div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
