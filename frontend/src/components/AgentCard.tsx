import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types/agent';
import toast from 'react-hot-toast';

interface AgentCardProps {
  agent: Agent;
  isInUserLibrary: boolean;
  showAddToLibrary: boolean;
  showRequestAccess: boolean;
  onAddToLibrary: () => void;
  onRequestAccess: () => void;
  onRemoveFromLibrary: () => void;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'premium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return '🤖';
    case 'google':
      return '🔍';
    case 'anthropic':
      return '🧠';
    case 'meta':
      return '📘';
    case 'microsoft':
      return '🪟';
    default:
      return '⚡';
  }
};

const getProviderColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'google':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'anthropic':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'meta':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'microsoft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AgentCard({
  agent,
  isInUserLibrary,
  showAddToLibrary,
  showRequestAccess,
  onAddToLibrary,
  onRequestAccess,
  onRemoveFromLibrary
}: AgentCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const truncatedDescription = agent.description.length > 120 
    ? `${agent.description.substring(0, 120)}...` 
    : agent.description;

  const hasLongDescription = agent.description.length > 120;

  const getActionButton = () => {
    if (isInUserLibrary) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction(onRemoveFromLibrary)}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <MinusIcon className="w-4 h-4" />
              <span>Remove</span>
            </>
          )}
        </motion.button>
      );
    }

    if (showRequestAccess) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction(onRequestAccess)}
          disabled={isLoading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ClockIcon className="w-4 h-4" />
              <span>Request Access</span>
            </>
          )}
        </motion.button>
      );
    }

    if (showAddToLibrary) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction(onAddToLibrary)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>Add to Library</span>
            </>
          )}
        </motion.button>
      );
    }

    return (
      <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-lg text-center">
        Not Available
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getProviderIcon(agent.provider)}</span>
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {agent.name}
            </h3>
          </div>
          
          {/* Provider Badge */}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getProviderColor(agent.provider)}`}>
              {agent.provider}
            </span>
            
            {/* Tier Badge */}
            {agent.metadata?.tier && (
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getTierColor(agent.metadata.tier)}`}>
                <StarIcon className="w-3 h-3 mr-1" />
                {agent.metadata.tier}
              </span>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0 ml-2">
          {isInUserLibrary ? (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
          ) : showRequestAccess ? (
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <InformationCircleIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 mb-4">
        <div className="text-sm text-gray-600 leading-relaxed">
          {showFullDescription ? agent.description : truncatedDescription}
        </div>
        
        {hasLongDescription && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors"
          >
            {showFullDescription ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {agent.metadata?.tags && agent.metadata.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {agent.metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {agent.metadata.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                +{agent.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Capabilities */}
      {agent.metadata?.capabilities && agent.metadata.capabilities.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.metadata.capabilities.slice(0, 2).map((capability, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
              >
                {capability}
              </span>
            ))}
            {agent.metadata.capabilities.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                +{agent.metadata.capabilities.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category */}
      {agent.metadata?.category && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Category: <span className="font-medium text-gray-700">{agent.metadata.category}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-4">
        {getActionButton()}
      </div>





      {/* Security Badge for Enterprise */}
      {agent.metadata?.tier === 'enterprise' && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
            <ShieldCheckIcon className="w-3 h-3 mr-1" />
            Enterprise
          </span>
        </div>
      )}
    </motion.div>
  );
}
