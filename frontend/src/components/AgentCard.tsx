import React, { useState } from 'react';
import {
  PlusIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CogIcon,
  InformationCircleIcon,
  TrashIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types/agent';

interface AgentCardProps {
  agent: Agent;
  isInUserLibrary: boolean;
  showAddToLibrary: boolean;
  showRequestAccess: boolean;
  currentLibrary: 'global' | 'company' | 'network' | 'personal';

  onAddToLibrary: () => void;
  onRequestAccess: () => void;
  onRemoveFromLibrary: () => void;
  onOpenAgent?: () => void;
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
    case 'wordpress':
      return '📝';
    default:
      return '⚡';
  }
};

const getProviderLogo = (provider: string, agentId?: string) => {
  switch (provider.toLowerCase()) {
    case 'google':
      // Use specific logos for Google agents
      if (agentId === 'gemini-chat-agent') {
        return '/Google-Gemini-Logo.png';
      }
      // Default Google logo for other Google agents
      return '/Google-AI-Logo-Vector.png';
    case 'wordpress':
      return '/wordpress-logo.png';
    default:
      return null; // No logo for other providers
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
    case 'wordpress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AgentCard({
  agent,
  isInUserLibrary,
  showAddToLibrary,
  showRequestAccess,
  currentLibrary,
  onAddToLibrary,
  onRequestAccess,
  onRemoveFromLibrary,
  onOpenAgent
}: AgentCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agent.name);
      // You could add a toast notification here if you want
      console.log('Agent name copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleAction = async (action: () => void, event: React.MouseEvent) => {
    // Prevent the card click from firing when clicking action buttons
    event.stopPropagation();
    event.preventDefault();
    
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
    // State 3: My Library (Personal) - Show Open button with small remove button below
    if (currentLibrary === 'personal' && isInUserLibrary) {
      return (
        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onOpenAgent) {
                onOpenAgent();
              } else {
                console.log('Opening agent:', agent.name);
                // Default behavior - could open in expanded view
                setShowExpandedView(true);
              }
            }}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Open</span>
              </>
            )}
          </button>
          
          {/* Small remove button below */}
          <button
            onClick={(e) => handleAction(onRemoveFromLibrary, e)}
            disabled={isLoading}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-1.5 px-2 text-sm rounded-md transition-all duration-200 flex items-center justify-center space-x-1 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <TrashIcon className="w-3 h-3" />
                <span>Remove from Library</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // State 1: Add to Library - for global library and company library (when not already in user library)
    if (showAddToLibrary && (currentLibrary === 'global' || currentLibrary === 'company')) {
      return (
        <button
          onClick={(e) => handleAction(onAddToLibrary, e)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>Add to Library</span>
            </>
          )}
        </button>
      );
    }

    // State 2: Request Access - for global library and company library (when approval is needed)
    if (showRequestAccess && (currentLibrary === 'global' || currentLibrary === 'company')) {
      return (
        <button
          onClick={(e) => handleAction(onRequestAccess, e)}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2 px-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ClockIcon className="w-4 h-4" />
              <span>Request Access</span>
            </>
          )}
        </button>
      );
    }

    // Special case: Agent is in user library but we're viewing from global/company library
    if (isInUserLibrary && (currentLibrary === 'global' || currentLibrary === 'company')) {
      return (
        <div className="text-center">
          <div className="text-green-600 text-sm font-medium mb-1">
            ✓ Already in your library
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              // Navigate to personal library or open agent
              if (onOpenAgent) {
                onOpenAgent();
              } else {
                console.log('Opening agent from global/company view:', agent.name);
                setShowExpandedView(true);
              }
            }}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Open Agent</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // Fallback for other states
    return (
      <div className="text-center text-gray-500 text-sm py-1.5">
        No actions available
      </div>
    );
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-300 group"
      >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <div className="mb-0">
            {/* Provider Branding - Above the name */}
            {agent.logo ? (
              <div className="flex justify-center -mb-1">
                <img 
                  src={agent.logo} 
                  alt={`${agent.name} logo`}
                  className="w-24 h-24 object-contain"
                />
              </div>
            ) : getProviderLogo(agent.provider, agent.id) ? (
              <div className="flex justify-center -mb-1">
                <img 
                  src={getProviderLogo(agent.provider, agent.id)} 
                  alt={`${agent.provider} logo`}
                  className="w-24 h-24 object-contain"
                />
              </div>
            ) : agent.id.startsWith('fake-') ? (
              <div className="flex justify-center -mb-1">
                <span className="text-5xl">{agent.icon || '🤖'}</span>
              </div>
            ) : (
              <div className="flex justify-center -mb-1">
                <span className="text-5xl">{getProviderIcon(agent.provider)}</span>
              </div>
            )}
            
            <h3 className="text-sm font-semibold text-gray-900 truncate text-center">
              {agent.name}
            </h3>
          </div>
          
          {/* Provider Badge */}
          <div className="flex items-center space-x-1 mb-1">
            <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full border ${getProviderColor(agent.provider)}`}>
              {agent.provider}
            </span>
            
            {/* Tier Badge */}
            {agent.metadata?.tier && (
              <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full border ${getTierColor(agent.metadata.tier)}`}>
                <StarIcon className="w-3 h-3 mr-1" />
                {agent.metadata.tier}
              </span>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0 ml-1 flex items-center space-x-1">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-md hover:bg-gray-100"
            title="Copy agent name"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {isInUserLibrary ? (
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-3 h-3 text-green-600" />
            </div>
          ) : showRequestAccess ? (
            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-3 h-3 text-yellow-600" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
              <InformationCircleIcon className="w-3 h-3 text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 mb-1">
        <div className="text-sm text-gray-600 leading-relaxed">
          {showFullDescription ? agent.description : truncatedDescription}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isInUserLibrary && onOpenAgent) {
              // If agent is in user library, use the onOpenAgent callback
              onOpenAgent();
            } else {
              // Otherwise, show the expanded view
              console.log('View Details clicked for agent:', agent.name);
              setShowExpandedView(true);
            }
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 transition-colors hover:underline cursor-pointer"
        >
          {isInUserLibrary ? 'Open Agent' : 'View Details'}
        </button>
      </div>

      {/* Library Status Notice */}
      {isInUserLibrary && (
        <div className="mb-1 p-1 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-1">
            <CheckCircleIcon className="w-3 h-3 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              ✓ This agent is already in your library
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            {currentLibrary === 'personal' 
              ? 'You can open it directly or remove it from your library'
              : 'You can open it directly from here or access it from your personal library'
            }
          </p>
        </div>
      )}

      {/* Tags */}
      {agent.metadata?.tags && agent.metadata.tags.length > 0 && (
        <div className="mb-1">
          <div className="flex flex-wrap gap-1">
            {agent.metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {agent.metadata.tags.length > 3 && (
              <span className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                +{agent.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Capabilities - Removed for POC compatibility */}

      {/* Category */}
      {agent.metadata?.category && (
        <div className="mb-1">
          <div className="flex items-center space-x-1">
            <CogIcon className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              Category: <span className="font-medium text-gray-700">{agent.metadata.category}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-1">
        {getActionButton()}
      </div>

      {/* Security Badge for Enterprise */}
      {agent.metadata?.tier === 'enterprise' && (
        <div className="absolute top-1 right-1">
          <span className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
            <ShieldCheckIcon className="w-3 h-3 mr-1" />
            Enterprise
          </span>
        </div>
      )}
    </div>

    {/* Expanded View Overlay - Outside the card but in the same component */}
    {showExpandedView && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[60vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {getProviderLogo(agent.provider, agent.id) ? (
                <img 
                  src={getProviderLogo(agent.provider, agent.id)} 
                  alt={`${agent.provider} logo`}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-4xl">{getProviderIcon(agent.provider)}</span>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
                <p className="text-gray-600 capitalize">{agent.provider}</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpandedView(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Description */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{agent.description}</p>
            </div>

            {/* Live App Demo */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live App Interface</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {agent.id === 'gemini-chat-agent' ? (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                    {/* Gemini App Interface Mockup */}
                    <div className="bg-white rounded-lg shadow-lg h-full p-4">
                      {/* App Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <img 
                            src="/Google-Gemini-Logo.png" 
                            alt="Gemini Logo" 
                            className="w-6 h-6 object-contain"
                          />
                          <span className="font-semibold text-gray-900">Gemini</span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Chat Interface */}
                      <div className="space-y-3">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg max-w-xs text-sm">
                            How can you help me with marketing data analysis?
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg max-w-xs text-sm">
                            I can help you analyze marketing data, create reports, and provide insights...
                          </div>
                        </div>
                        
                        {/* Input Field */}
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-400 text-sm">Type your message...</span>
                            <div className="ml-auto">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎬</span>
                      </div>
                      <p className="text-lg font-medium">Demo Coming Soon</p>
                      <p className="text-sm text-gray-300 mt-2">Live app interface will be available soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agent Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {agent.metadata?.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <p className="text-gray-900">{agent.metadata.category}</p>
                  </div>
                )}
                {agent.metadata?.tier && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tier:</span>
                    <p className="text-gray-900 capitalize">{agent.metadata.tier}</p>
                  </div>
                )}
                {agent.metadata?.tags && agent.metadata.tags.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {agent.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-200">
              {getActionButton()}
              <button
                onClick={() => setShowExpandedView(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
