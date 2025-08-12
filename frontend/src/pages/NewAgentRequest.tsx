import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import NewAgentRequestForm from '../components/NewAgentRequestForm';

export default function NewAgentRequestPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

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
                Request Agent
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
              <span className="text-4xl mr-3">📋</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Request a New AI Agent
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Need an AI agent that doesn't exist yet? Submit a request and our team will work to make it available for you.
            </p>

            {/* Request Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Custom Solutions</h3>
                <p className="text-blue-700 text-sm">
                  Request agents tailored to your specific business needs and use cases
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
              >
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Priority Processing</h3>
                <p className="text-green-700 text-sm">
                  High-priority requests get expedited review and development
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200"
              >
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Collaboration</h3>
                <p className="text-purple-700 text-sm">
                  Work with our team to refine requirements and ensure success
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">New Agent Request</h2>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Start Request
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Submit a detailed request for a new AI agent that meets your specific requirements
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to request a new agent?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Click the "Start Request" button above to begin filling out your agent request form. 
                We'll review your requirements and work to make the agent available.
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                Begin Agent Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      <NewAgentRequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        currentLibrary="global"
      />
    </div>
  );
}
