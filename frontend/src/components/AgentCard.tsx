import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Agent } from '../types/agent'
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface AgentCardProps {
  agent: Agent
  companyBranding?: {
    primaryColor: string
    secondaryColor: string
  }
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

export default function AgentCard({ agent, companyBranding }: AgentCardProps) {
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
      </Link>
    </motion.div>
  )
}
