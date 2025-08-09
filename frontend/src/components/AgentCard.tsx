import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Agent } from '../types/agent'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  TagIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface AgentCardProps {
  agent: Agent
  companyBranding?: {
    primaryColor: string
    secondaryColor: string
  }
  showAddToLibrary?: boolean
  onAddToLibrary?: (agent: Agent) => void
  isInUserLibrary?: boolean
}

const providerColors = {
  openai: 'bg-green-100 text-green-800',
  google: 'bg-blue-100 text-blue-800',
  anthropic: 'bg-purple-100 text-purple-800'
}

const providerIcons = {
  openai: '🤖',
  google: '🔍',
  anthropic: '🧠'
}

export default function AgentCard({ agent, companyBranding, showAddToLibrary = true, onAddToLibrary, isInUserLibrary = false }: AgentCardProps) {
  const { userProfile } = useAuth()
  
  // Determine permission type from agent metadata
  const permissionType = agent.metadata?.permissionType || 'direct' // 'direct' or 'approval'
  const tier = agent.metadata?.tier || 'free' // 'free' or 'premium'
  
  const handleAddToLibrary = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to agent page
    e.stopPropagation()
    
    if (!userProfile) {
      toast.error('Please sign in to add agents to your library')
      return
    }
    
    if (permissionType === 'direct') {
      // Direct assignment - add immediately
      toast.success(`${agent.name} added to your library!`)
      if (onAddToLibrary) {
        onAddToLibrary(agent)
      }
    } else if (permissionType === 'approval') {
      // Requires approval - submit request
      toast.success(`Request submitted for ${agent.name}. Your admin will review it.`)
      if (onAddToLibrary) {
        onAddToLibrary(agent)
      }
    }
  }
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/agents/${agent.id}`}>
        <div className="agent-card h-full flex flex-col group">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: companyBranding 
                    ? `linear-gradient(to bottom right, ${companyBranding.primaryColor}, ${companyBranding.secondaryColor})`
                    : 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)'
                }}
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {agent.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${providerColors[agent.provider]}`}>
                    {providerIcons[agent.provider]} {agent.provider}
                  </span>
                  {agent.visibility === 'private' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🔒 Private
                    </span>
                  )}
                  {isInUserLibrary && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ In My Library
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 flex-grow">
            {agent.description}
          </p>

          {/* Tags */}
          {agent.metadata?.tags && agent.metadata.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-2">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.metadata.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {agent.metadata.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                    +{agent.metadata.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            {/* Add to Library Button */}
            {showAddToLibrary && (
              <div className="mb-3">
                {isInUserLibrary ? (
                  <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 cursor-not-allowed">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Already in Library</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToLibrary}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      permissionType === 'direct'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {permissionType === 'direct' ? (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        <span>Add to Library</span>
                        <span className="text-xs opacity-75">({tier})</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-4 h-4" />
                        <span>Request Access</span>
                        <span className="text-xs opacity-75">({tier})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* Start Chat Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span>Start Chat</span>
              </div>
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
