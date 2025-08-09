import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  displayName: string
  role: 'super_admin' | 'company_admin' | 'user'
  organizationId: string
  organizationName: string
  assignedAgents: string[]
  status: 'active' | 'suspended'
  lastLogin: string
  createdAt: string
}

interface Agent {
  id: string
  name: string
  description: string
  category: string
  icon: string
}

export default function AdminUserManagement() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    loadUsers()
    loadAgents()
  }, [])

  const loadUsers = async () => {
    try {
      // Mock data - replace with real API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@transparent.partners',
          displayName: 'John Doe',
          role: 'user',
          organizationId: 'transparent-partners',
          organizationName: 'Transparent Partners',
          assignedAgents: ['briefing-agent', 'analytics-agent'],
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'jane.smith@transparent.partners',
          displayName: 'Jane Smith',
          role: 'company_admin',
          organizationId: 'transparent-partners',
          organizationName: 'Transparent Partners',
          assignedAgents: ['briefing-agent', 'analytics-agent', 'interview-agent'],
          status: 'active',
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-05T00:00:00Z'
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadAgents = async () => {
    try {
      // Mock data - replace with real API call
      const mockAgents: Agent[] = [
        {
          id: 'briefing-agent',
          name: 'Briefing Agent',
          description: 'Summarizes documents and meetings',
          category: 'Productivity',
          icon: '📄'
        },
        {
          id: 'analytics-agent',
          name: 'Analytics Agent',
          description: 'Data analysis and insights',
          category: 'Analytics',
          icon: '📊'
        },
        {
          id: 'interview-agent',
          name: 'Interview Agent',
          description: 'Structured interviews and notes',
          category: 'HR',
          icon: '🎤'
        }
      ]
      setAgents(mockAgents)
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      // Mock API call - replace with real implementation
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        displayName: userData.displayName!,
        role: userData.role || 'user',
        organizationId: userProfile?.organizationId || '',
        organizationName: userProfile?.organizationName || '',
        assignedAgents: [],
        status: 'active',
        lastLogin: '',
        createdAt: new Date().toISOString()
      }
      
      setUsers(prev => [...prev, newUser])
      setShowCreateModal(false)
      toast.success('User created successfully')
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleAssignAgents = async (userId: string, agentIds: string[]) => {
    try {
      // Mock API call - replace with real implementation
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, assignedAgents: agentIds }
          : user
      ))
      setShowAssignModal(false)
      toast.success('Agent assignments updated')
    } catch (error) {
      console.error('Failed to assign agents:', error)
      toast.error('Failed to assign agents')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      // Mock API call - replace with real implementation
      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UsersIcon className="w-8 h-8 mr-3 text-brand-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage user accounts and agent assignments
              </p>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create User
            </button>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Agents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.displayName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'company_admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.assignedAgents.map(agentId => {
                          const agent = agents.find(a => a.id === agentId)
                          return agent ? (
                            <span key={agentId} className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {agent.icon} {agent.name}
                            </span>
                          ) : null
                        })}
                        {user.assignedAgents.length === 0 && (
                          <span className="text-sm text-gray-500">No agents assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAssignModal(true)
                          }}
                          className="text-brand-600 hover:text-brand-700"
                          title="Assign Agents"
                        >
                          <CogIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete User"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
            organizationName={userProfile?.organizationName || ''}
          />
        )}

        {/* Assign Agents Modal */}
        {showAssignModal && selectedUser && (
          <AssignAgentsModal
            user={selectedUser}
            agents={agents}
            onClose={() => {
              setShowAssignModal(false)
              setSelectedUser(null)
            }}
            onSubmit={handleAssignAgents}
          />
        )}
      </div>
    </div>
  )
}

// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void
  onSubmit: (userData: Partial<User>) => void
  organizationName: string
}

function CreateUserModal({ onClose, onSubmit, organizationName }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'user' as 'user' | 'company_admin'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.displayName) {
      toast.error('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'user' | 'company_admin' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="user">User</option>
              <option value="company_admin">Company Admin</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Organization:</strong> {organizationName}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Create User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Assign Agents Modal Component
interface AssignAgentsModalProps {
  user: User
  agents: Agent[]
  onClose: () => void
  onSubmit: (userId: string, agentIds: string[]) => void
}

function AssignAgentsModal({ user, agents, onClose, onSubmit }: AssignAgentsModalProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>(user.assignedAgents)

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handleSubmit = () => {
    onSubmit(user.id, selectedAgents)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Agents to {user.displayName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAgents.includes(agent.id)
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAgentToggle(agent.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                </div>
                {selectedAgents.includes(agent.id) && (
                  <CheckIcon className="w-5 h-5 text-brand-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 btn-primary"
          >
            Update Assignments
          </button>
        </div>
      </motion.div>
    </div>
  )
}
