import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Your Team with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Drive meaningful productivity gains with our curated collection of AI agents. 
              Built for transparency, designed for results, optimized for your business success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Watch Agents in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience live demonstrations of our AI agents solving real business challenges
            </p>
          </div>

          {/* Demo Display */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Video/Thumbnail Area */}
                <div className="relative bg-gray-900 min-h-[400px] flex items-center justify-center">
                  {/* Placeholder for video content */}
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">▶️</span>
                    </div>
                    <p className="text-lg font-medium">Demo Video Coming Soon</p>
                    <p className="text-sm text-gray-300 mt-2">Interactive demonstration of AI agents in action</p>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Live Demo
                    </span>
                  </div>
                </div>

                {/* Demo Information */}
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Marketing Automation Agent
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Automates social media posting, email campaigns, and content scheduling with AI-driven optimization. 
                    See how it analyzes performance data and adjusts strategies in real-time.
                  </p>
                  
                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        Social Media Management
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        Email Campaigns
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        Content Scheduling
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        Performance Analytics
                      </div>
                    </div>
                  </div>

                  {/* Demo Actions */}
                  <div className="flex gap-3">
                    <Link
                      to="/agents"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <span>▶️</span>
                      Watch Full Demo
                    </Link>
                    <Link
                      to="/agents"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>👁️</span>
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We Can Help You Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Can Help You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you want to explore and manage your AI agents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Global Library Card */}
            <div className="relative">
              <Link to="/agents" className="block group">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 h-full hover:shadow-xl transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl">🏛️</span>
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
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* My Library Card */}
            <div className="relative">
              <Link to="/login" className="block group">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 h-full hover:shadow-xl transition-all duration-200">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    My Agent Library
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Sign in to access your personalized AI agent collection. Save favorites, 
                    manage integrations, and build your custom AI workforce.
                  </p>
                  <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
                    Sign In to Access
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Library Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What is the Transparent Agent Library?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive collection of AI agents where you can explore capabilities, 
              watch live demonstrations, and understand exactly how each agent works before integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Explore Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔍</span>
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
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Demo Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">▶️</span>
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
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Transparency Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🛡️</span>
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
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a taste of what's available in our library
            </p>
          </div>

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
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {agent.category}
                  </span>
                  {agent.demoAvailable && (
                    <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <span>▶️</span>
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
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Learn More
                  </Link>
                  {agent.demoAvailable && (
                    <Link
                      to="/agents"
                      className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <span>▶️</span>
                      Watch Demo
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/agents"
              className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
            >
              <span>🏛️</span>
              View Complete Library
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Explore the Transparent Agent Library?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Start browsing our AI agents, watch live demos, and discover how transparent AI can transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/agents"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>👁️</span>
              View Library
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-teal-600 transition-colors"
            >
              <span>▶️</span>
              Watch Demos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
