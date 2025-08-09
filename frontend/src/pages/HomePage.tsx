import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpenIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Your Team with{' '}
              <span className="text-brand-600">
                Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Drive meaningful productivity gains with our curated collection of AI agents. 
              Built for transparency, designed for results, optimized for your business success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Solutions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              We Can Help You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your business operations with intelligent AI agents designed 
              to accelerate progress and drive meaningful results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Agent Library Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <Link to="/agents" className="block group">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                  <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center mb-6">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Explore Our Agent Library
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Access a curated collection of specialized AI agents designed to maximize 
                    productivity across marketing, operations, and strategic initiatives.
                  </p>
                  <div className="flex items-center text-brand-600 font-medium group-hover:text-brand-700 transition-colors">
                    Browse All Agents
                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* My Agents Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <Link to={currentUser ? "/my-agents" : "/login"} className="block group">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                  <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mb-6">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Manage Your Agent Team
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Build and optimize your personal AI workforce. Track performance, 
                    manage integrations, and accelerate your path to operational excellence.
                  </p>
                  <div className="flex items-center text-primary-700 font-medium group-hover:text-primary-800 transition-colors">
                    {currentUser ? 'Access Dashboard' : 'Get Started'}
                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Agents?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with transparency, reliability, and performance in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparent AI',
                description: 'Clear, explainable AI decisions with full visibility into how agents work.',
                icon: '🔍'
              },
              {
                title: 'Enterprise Ready',
                description: 'Built for scale with security, compliance, and reliability at the core.',
                icon: '🏢'
              },
              {
                title: 'Easy Integration',
                description: 'Simple APIs and SDKs to integrate agents into your existing workflows.',
                icon: '⚡'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
