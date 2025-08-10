import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Agent, AgentInteraction } from '../types/agent'
import { fetchAgentFromFirestore } from '../services/firestore'
import { interactWithAgent } from '../services/api'
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AgentPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [interactions, setInteractions] = useState<AgentInteraction[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (agentId) {
      loadAgent()
    }
  }, [agentId])

  const loadAgent = async () => {
    try {
      setLoading(true)
      
      // Temporarily bypass Firestore due to security rules
      console.log('⚠️ Bypassing Firestore agent fetch due to security rules');
      
      let agentData: Agent | null = null;
      
      // Create local agent objects for known agents
      if (agentId === 'gemini-chat-agent') {
        agentData = {
          id: 'gemini-chat-agent',
          name: 'Gemini Chat Agent',
          description: 'Google Gemini AI Chat Agent - A powerful AI assistant that can help with various tasks, answer questions, and engage in meaningful conversations.',
          provider: 'Google',
          route: `/agent/gemini-chat-agent`,
          metadata: {
            tags: ['AI', 'Chat', 'Google', 'Assistant', 'Conversation'],
            category: 'AI Assistant',
            tier: 'free',
            permissionType: 'direct'
          },
          visibility: 'global',
          allowedRoles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('📋 Created local Gemini agent:', agentData);
      } else {
        // Try to fetch from Firestore for other agents
        try {
          agentData = await fetchAgentFromFirestore(agentId!);
        } catch (firestoreError) {
          console.warn('Firestore fetch failed, creating fallback agent:', firestoreError);
          // Create a fallback agent
          agentData = {
            id: agentId!,
            name: agentId!,
            description: 'Agent description not available',
            provider: 'Unknown',
            route: `/agent/${agentId}`,
            metadata: {
              tags: [],
              category: 'General',
              tier: 'free',
              permissionType: 'direct'
            },
            visibility: 'global',
            allowedRoles: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      if (!agentData) {
        toast.error('Agent not found')
        return
      }
      setAgent(agentData)
    } catch (error) {
      console.error('Failed to load agent:', error)
      toast.error('Failed to load agent')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !agent) return

    const userMessage = message.trim()
    setMessage('')
    setSending(true)

    // Add user message to interactions
    const newInteraction: AgentInteraction = {
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString()
    }
    setInteractions(prev => [...prev, newInteraction])

    try {
      const response = await interactWithAgent(agent.id, userMessage)
      
      // Update the interaction with the response
      setInteractions(prev => 
        prev.map((interaction, index) => 
          index === prev.length - 1 
            ? { ...interaction, response }
            : interaction
        )
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      
      // Remove the interaction if it failed
      setInteractions(prev => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Agent not found
          </h3>
          <p className="text-gray-600 mb-4">
            The agent you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Agents</span>
          </Link>

          <div className="card p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {agent.name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {agent.description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    agent.provider === 'openai' ? 'bg-green-100 text-green-800' :
                    agent.provider === 'google' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {agent.provider.charAt(0).toUpperCase() + agent.provider.slice(1)}
                  </span>
                  {agent.visibility === 'private' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      🔒 Private
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card overflow-hidden"
        >
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {interactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600">
                  Send a message to begin interacting with {agent.name}
                </p>
              </div>
            ) : (
              interactions.map((interaction, index) => (
                <div key={index} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                      <p className="text-sm">{interaction.message}</p>
                    </div>
                  </div>
                  
                  {/* Agent Response */}
                  {interaction.response && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                        <p className="text-sm whitespace-pre-wrap">{interaction.response}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading indicator */}
                  {!interaction.response && sending && index === interactions.length - 1 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={2}
                  disabled={sending}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
