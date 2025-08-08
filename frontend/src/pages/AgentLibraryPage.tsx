import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AgentCard from '../components/AgentCard'
import FilterBar from '../components/FilterBar'
import { Agent } from '../types/agent'
import { fetchAgents } from '../services/api'

export default function AgentLibraryPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    provider: '',
    search: ''
  })

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const data = await fetchAgents()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = !filters.category || agent.metadata?.category === filters.category
    const matchesProvider = !filters.provider || agent.provider === filters.provider
    const matchesSearch = !filters.search || 
      agent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      agent.description.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesCategory && matchesProvider && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agent Library
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and interact with our curated collection of AI agents
          </p>
        </motion.div>

        {/* Filters */}
        <FilterBar filters={filters} onFiltersChange={setFilters} />
        
        {/* Agents Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            {filteredAgents.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No agents found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new agents.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <AgentCard agent={agent} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
