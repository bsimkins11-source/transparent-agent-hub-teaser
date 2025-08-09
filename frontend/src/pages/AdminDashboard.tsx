import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  CogIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalUsers: number
  totalAgents: number
  totalOrganizations: number
  monthlyInteractions: number
  pendingRequests: number
}

export default function AdminDashboard() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalOrganizations: 0,
    monthlyInteractions: 0,
    pendingRequests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    try {
      // Mock data for now - replace with real API call
      setTimeout(() => {
        setStats({
          totalUsers: 24,
          totalAgents: 8,
          totalOrganizations: userProfile?.role === 'super_admin' ? 3 : 1,
          monthlyInteractions: 1247,
          pendingRequests: 5
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to load admin stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  const isSuperAdmin = userProfile?.role === 'super_admin'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSuperAdmin 
                  ? 'Global system management and oversight'
                  : `Manage ${userProfile?.organizationName} users and agents`
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Reports
              </button>
              <button className="btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                {isSuperAdmin ? 'Add Organization' : 'Add User'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UsersIcon}
            color="bg-blue-500"
            change="+12%"
          />
          <StatCard
            title="Active Agents"
            value={stats.totalAgents}
            icon={CogIcon}
            color="bg-green-500"
            change="+3"
          />
          {isSuperAdmin && (
            <StatCard
              title="Organizations"
              value={stats.totalOrganizations}
              icon={BuildingOfficeIcon}
              color="bg-purple-500"
              change="+1"
            />
          )}
          <StatCard
            title="Monthly Usage"
            value={stats.monthlyInteractions.toLocaleString()}
            icon={ChartBarIcon}
            color="bg-orange-500"
            change="+23%"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
                User Management
              </h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {stats.pendingRequests} pending
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and agent assignments
            </p>
            <div className="space-y-2">
              <a href="/admin/users" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                👥 Manage Users
              </a>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                ⏳ Review Pending Requests ({stats.pendingRequests})
              </button>
              <a href="/admin/users" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                🔧 Create & Assign Users
              </a>
            </div>
          </motion.div>

          {/* Agent Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
                Agent Store Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure agents, permissions, and store settings
            </p>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                🤖 Manage Agents
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                ⚙️ Agent Permissions
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                📊 Usage Analytics
              </button>
            </div>
          </motion.div>
        </div>

        {/* Super Admin Only */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-purple-600" />
              Organization Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Transparent Partners</h4>
                <p className="text-sm text-gray-600">18 users • 6 agents</p>
                <button className="text-xs text-brand-600 hover:text-brand-700 mt-2">
                  Manage →
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Demo Organization</h4>
                <p className="text-sm text-gray-600">4 users • 2 agents</p>
                <button className="text-xs text-brand-600 hover:text-brand-700 mt-2">
                  Manage →
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  <PlusIcon className="w-5 h-5 mx-auto mb-1" />
                  Add Organization
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  change?: string
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
