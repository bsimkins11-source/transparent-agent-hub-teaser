import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import AgentCard from '../components/AgentCard'
import { Agent } from '../types/agent'
import { getUserAssignedAgents } from '../services/userLibraryService'
import { fetchAgentsFromFirestore } from '../services/firestore'
import { 
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function MyAgentsPage() {
  const { currentUser, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userAgents, setUserAgents] = useState<Agent[]>([])
  const [allAgents, setAllAgents] = useState<Agent[]>([])
  
  useEffect(() => {
    if (userProfile?.uid) {
      loadUserAgents()
    }
  }, [userProfile])

  const loadUserAgents = async () => {
    try {
      setLoading(true)
      
      // Get all agents from Firestore
      const { agents } = await fetchAgentsFromFirestore()
      setAllAgents(agents)
      
      // Get user's assigned agent IDs
      const assignedAgentIds = await getUserAssignedAgents(userProfile!.uid)
      
      // Filter to get only assigned agents
      const assignedAgents = agents.filter(agent => assignedAgentIds.includes(agent.id))
      setUserAgents(assignedAgents)
      
    } catch (error) {
      console.error('Failed to load user agents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Temporarily allow access without authentication for design testing
  const isAuthenticated = currentUser

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sign in required
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to access your personalized agents.
          </p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Sidebar />
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Your Personal Agent Team
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your AI-powered productivity squad is ready to work
            </p>
          </motion.div>

          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-gray-600">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <SparklesIcon className="w-4 h-4" />
                <span>Premium Plan</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Interactions"
              value="1,247"
              change="+12% this month"
              icon={ChatBubbleLeftRightIcon}
              iconColor="text-blue-600"
              changeColor="text-green-600"
            />
            <StatCard
              title="Active Agents"
              value="8"
              change="3 new this week"
              icon={SparklesIcon}
              iconColor="text-purple-600"
              changeColor="text-blue-600"
            />
            <StatCard
              title="Time Saved"
              value="47h"
              change="This month"
              icon={ClockIcon}
              iconColor="text-green-600"
              changeColor="text-green-600"
            />
            <StatCard
              title="Efficiency"
              value="94%"
              change="+5% this week"
              icon={ChartBarIcon}
              iconColor="text-orange-600"
              changeColor="text-orange-600"
            />
          </motion.div>

          {/* User's Assigned Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card rounded-2xl p-8 mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Your Agent Library ({userAgents.length})
                </h3>
                <p className="text-gray-600">
                  Agents available in your personal library
                </p>
              </div>
              <Link 
                to="/agents" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add More Agents</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userAgents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No agents in your library yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Browse our agent marketplace to add your first AI assistant
                </p>
                <Link 
                  to="/agents" 
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Browse Agents</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AgentCard 
                      agent={agent} 
                      isInUserLibrary={true}
                      showAddToLibrary={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Main Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/agents">
                <div className="action-card group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Browse Agents
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Explore our full collection of AI agents and discover new capabilities
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="action-card group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recent Activity
                </h3>
                <p className="text-gray-600 text-sm">
                  View your latest agent interactions and usage analytics
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="action-card group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Agent
                </h3>
                <p className="text-gray-600 text-sm">
                  Build your own AI agent tailored to your specific needs
                </p>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h3>
              <Link to="/agents" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Start Your Journey
                </h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Begin interacting with agents to see your activity history and analytics here.
                </p>
                <Link to="/agents" className="btn-primary">
                  Explore Agents
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
