import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AgentSubmission from '../components/AgentSubmission';

export default function AgentSubmissionPage() {
  return (
    <div className="min-h-screen bg-gray-50 pl-8 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pl-8">
          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
              <span className="text-sm font-medium text-gray-900">
                Submit Agent
              </span>
            </ol>
          </nav>

          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">🚀</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Submit Your AI Agent
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Share your AI agent with the community. Submit your agent for review and approval to make it available to users worldwide.
            </p>

            {/* Submission Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
              >
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Global Reach</h3>
                <p className="text-green-700 text-sm">
                  Make your agent available to users worldwide through our platform
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
              >
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Monetization</h3>
                <p className="text-blue-700 text-sm">
                  Set your own pricing and earn revenue from agent usage
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200"
              >
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Quality Control</h3>
                <p className="text-purple-700 text-sm">
                  Our review process ensures high-quality, safe agents
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Agent Submission Form</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Fill out the form below to submit your AI agent for review and approval
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <AgentSubmission />
          </div>
        </div>
      </div>
    </div>
  );
}
