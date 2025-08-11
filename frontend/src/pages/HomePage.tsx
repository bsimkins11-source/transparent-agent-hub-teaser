import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpenIcon,
  UserIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  PlayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const { currentUser } = useAuth()
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0)

  // Sample demo data - this can be replaced with real demo content later
  const agentDemos = [
    {
      id: 1,
      title: 'Marketing Automation Agent',
      description: 'Automates social media posting, email campaigns, and content scheduling with AI-driven optimization.',
      category: 'Marketing',
      videoThumbnail: '/api/placeholder/400/300',
      demoUrl: '/agents/marketing-automation/demo',
      features: ['Social Media Management', 'Email Campaigns', 'Content Scheduling', 'Performance Analytics']
    },
    {
      id: 2,
      title: 'Data Analysis Agent',
      description: 'See real-time data processing, insight generation, and automated report creation in action.',
      category: 'Analytics',
      videoThumbnail: '/api/placeholder/400/300',
      demoUrl: '/agents/data-analysis/demo',
      features: ['Real-time Processing', 'Insight Generation', 'Report Creation', 'Data Visualization']
    },
    {
      id: 3,
      title: 'Customer Support Agent',
      description: 'Experience seamless customer interaction handling with instant responses and intelligent escalation.',
      category: 'Support',
      videoThumbnail: '/api/placeholder/400/300',
      demoUrl: '/agents/customer-support/demo',
      features: ['Instant Responses', 'Multi-language Support', 'Issue Escalation', 'Customer Satisfaction']
    },
    {
      id: 4,
      title: 'Process Optimization Agent',
      description: 'Watch how AI identifies workflow bottlenecks and suggests improvements for maximum efficiency.',
      category: 'Operations',
      videoThumbnail: '/api/placeholder/400/300',
      demoUrl: '/agents/process-optimization/demo',
      features: ['Workflow Analysis', 'Bottleneck Detection', 'Efficiency Metrics', 'Optimization Suggestions']
    }
  ]

  // Auto-rotate demos every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoIndex((prev) => (prev + 1) % agentDemos.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [agentDemos.length])

  const nextDemo = () => {
    setCurrentDemoIndex((prev) => (prev + 1) % agentDemos.length)
  }

  const prevDemo = () => {
    setCurrentDemoIndex((prev) => (prev - 1 + agentDemos.length) % agentDemos.length)
  }

  const goToDemo = (index: number) => {
    setCurrentDemoIndex(index)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 lg:py-28">
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

      {/* Agent Demos Carousel Tile */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Watch Agents in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience live demonstrations of our AI agents solving real business challenges
            </p>
          </motion.div>

          {/* Demo Carousel */}
          <div className="relative max-w-6xl mx-auto">
            {/* Main Demo Display */}
            <motion.div
              key={currentDemoIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Video/Thumbnail Area */}
                <div className="relative bg-gray-900 min-h-[400px] flex items-center justify-center">
                  {/* Placeholder for video content */}
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-lg font-medium">Demo Video Coming Soon</p>
                    <p className="text-sm text-gray-300 mt-2">Interactive demonstration of {agentDemos[currentDemoIndex].title}</p>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {agentDemos[currentDemoIndex].category}
                    </span>
                  </div>
                </div>

                {/* Demo Information */}
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {agentDemos[currentDemoIndex].title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {agentDemos[currentDemoIndex].description}
                  </p>
                  
                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {agentDemos[currentDemoIndex].features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-brand-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demo Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={agentDemos[currentDemoIndex].demoUrl}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Watch Full Demo
                    </Link>
                    <Link
                      to="/agents"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={prevDemo}
                className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Previous demo"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Demo Indicators */}
              <div className="flex space-x-2">
                {agentDemos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToDemo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentDemoIndex 
                        ? 'bg-brand-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to demo ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextDemo}
                className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Next demo"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Auto-play indicator */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Demos auto-rotate every 8 seconds • Click indicators to jump to specific demos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* We Can Help You Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Can Help You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you want to explore and manage your AI agents
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Global Library Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Link to="/agents" className="block group">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <BuildingLibraryIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Global Agent Library
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Browse our complete collection of AI agents. No sign-in required. 
                    Explore capabilities, watch demos, and discover new solutions for your business.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Browse All Agents
                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* My Library Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              {currentUser ? (
                <Link to="/my-agents" className="block group">
                  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      My Agent Library
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Access your personalized AI agent collection. Manage integrations, 
                      track performance, and optimize your AI workforce.
                    </p>
                    <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
                      Go to Dashboard
                      <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="block group">
                  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                      <LockClosedIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      My Agent Library
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Sign in to access your personalized AI agent collection. Save favorites, 
                      manage integrations, and build your custom AI workforce.
                    </p>
                    <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                      Sign In to Access
                      <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Library Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What is the Transparent Agent Library?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive collection of AI agents where you can explore capabilities, 
              watch live demonstrations, and understand exactly how each agent works before integration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Explore Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Explore Agents
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our extensive collection of AI agents, each with detailed descriptions, 
                use cases, and performance metrics.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Start Exploring
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>

            {/* Demo Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlayIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Watch Live Demos
              </h3>
              <p className="text-gray-600 mb-6">
                See agents in action with interactive demonstrations that show real-world 
                applications and performance capabilities.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                View Demos
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>

            {/* Transparency Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Full Transparency
              </h3>
              <p className="text-gray-600 mb-6">
                Understand exactly how each agent works with detailed explanations, 
                decision-making processes, and performance analytics.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Learn More
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Agents Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a taste of what's available in our library
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Marketing Automation Agent',
                description: 'Automates social media posting, email campaigns, and content scheduling with AI-driven optimization.',
                category: 'Marketing',
                demoAvailable: true
              },
              {
                title: 'Data Analysis Agent',
                description: 'Processes complex datasets, generates insights, and creates visual reports automatically.',
                category: 'Analytics',
                demoAvailable: true
              },
              {
                title: 'Customer Support Agent',
                description: 'Handles customer inquiries, provides instant responses, and escalates complex issues.',
                category: 'Support',
                demoAvailable: true
              },
              {
                title: 'Content Creation Agent',
                description: 'Generates blog posts, social media content, and marketing copy tailored to your brand.',
                category: 'Content',
                demoAvailable: false
              },
              {
                title: 'Process Optimization Agent',
                description: 'Analyzes workflows, identifies bottlenecks, and suggests improvements for efficiency.',
                category: 'Operations',
                demoAvailable: true
              },
              {
                title: 'Financial Planning Agent',
                description: 'Creates budgets, forecasts cash flow, and provides financial insights for decision-making.',
                category: 'Finance',
                demoAvailable: false
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-medium transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {agent.category}
                  </span>
                  {agent.demoAvailable && (
                    <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <PlayIcon className="w-3 h-3" />
                      Demo
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {agent.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {agent.description}
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/agents"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    Learn More
                  </Link>
                  {agent.demoAvailable && (
                    <Link
                      to="/agents"
                      className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <PlayIcon className="w-3 h-3" />
                      Watch Demo
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to="/agents"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-lg"
            >
              <BuildingLibraryIcon className="w-6 h-6" />
              View Complete Library
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Use the Transparent Agent Library
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to explore, understand, and integrate AI agents
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Browse',
                description: 'Explore our comprehensive collection of AI agents by category, use case, or performance metrics.',
                icon: MagnifyingGlassIcon
              },
              {
                step: '2',
                title: 'Watch Demos',
                description: 'See agents in action with interactive demonstrations and real-world examples.',
                icon: PlayIcon
              },
              {
                step: '3',
                title: 'Understand',
                description: 'Learn how each agent works with detailed explanations and transparency reports.',
                icon: ChartBarIcon
              },
              {
                step: '4',
                title: 'Integrate',
                description: 'Choose the right agent and integrate it into your workflow with our simple APIs.',
                icon: SparklesIcon
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                    <Icon className="w-8 h-8 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Explore the Transparent Agent Library?
            </h2>
            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
              Start browsing our AI agents, watch live demos, and discover how transparent AI can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agents"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                <EyeIcon className="w-6 h-6" />
                View Library
              </Link>
              <Link
                to="/agents"
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
              >
                <PlayIcon className="w-6 h-6" />
                Watch Demos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
