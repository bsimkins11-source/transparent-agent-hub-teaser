import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  StarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface FilterBarProps {
  filters: {
    category: string;
    provider: string;
    search: string;
    tier: string;
    access: string;
    tags: string[];
    sortBy: string;
    sortOrder: string;
  };
  onFiltersChange: (filters: any) => void;
  availableCategories: string[];
  availableTags: string[];
  totalAgents: number;
  filteredCount: number;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  totalAgents,
  filteredCount,
  showAdvancedFilters,
  onToggleAdvancedFilters
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFiltersChange]);

  const quickFilterPresets = [
    {
      name: 'Free Agents',
      filters: { tier: 'free', access: 'available' },
      icon: '🆓',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      name: 'Premium Agents',
      filters: { tier: 'premium', access: 'available' },
      icon: '💎',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'Enterprise',
      filters: { tier: 'enterprise' },
      icon: '🏢',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      name: 'In My Library',
      filters: { access: 'in-library' },
      icon: '📚',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      name: 'OpenAI',
      filters: { provider: 'openai' },
      icon: '🤖',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      name: 'Google',
      filters: { provider: 'google' },
      icon: '🔍',
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  const applyQuickFilter = (preset: any) => {
    onFiltersChange({ ...filters, ...preset.filters });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      provider: '',
      search: '',
      tier: '',
      access: '',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'asc'
    });
    setLocalSearch('');
  };

  const hasActiveFilters = filters.category || filters.provider || filters.tier || filters.access || filters.tags.length > 0;

  const activeFilterCount = [
    filters.category,
    filters.provider,
    filters.tier,
    filters.access,
    ...filters.tags
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Basic Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-gray-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Filter Dropdowns */}
            <div className="flex gap-2">
              <select
                value={filters.tier}
                onChange={(e) => onFiltersChange({ ...filters, tier: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400 min-w-[100px]"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={filters.access}
                onChange={(e) => onFiltersChange({ ...filters, access: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400 min-w-[120px]"
              >
                <option value="">All Access</option>
                <option value="available">Available</option>
                <option value="in-library">In Library</option>
                <option value="restricted">Restricted</option>
              </select>

              <select
                value={filters.provider}
                onChange={(e) => onFiltersChange({ ...filters, provider: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400 min-w-[120px]"
              >
                <option value="">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
                <option value="anthropic">Anthropic</option>
                <option value="meta">Meta</option>
                <option value="microsoft">Microsoft</option>
              </select>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Results Count */}
            <div className="text-sm text-gray-600 hidden sm:block">
              <span className="font-medium">{filteredCount}</span> of {totalAgents} agents
            </div>

            {/* Quick Filters Toggle */}
            <button
              onClick={() => setShowQuickFilters(!showQuickFilters)}
              className={`px-3 py-2 border rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                showQuickFilters 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Quick</span>
            </button>

            {/* Advanced Filters Toggle */}
            <button
              onClick={onToggleAdvancedFilters}
              className={`px-3 py-2 border rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                showAdvancedFilters 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Advanced</span>
            </button>

            {/* Sort Options */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors hover:border-gray-400 flex items-center space-x-2"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
                <span>Sort</span>
                {showSortOptions ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                  >
                    <div className="p-2 space-y-1">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Sort by</label>
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'name', label: 'Name' },
                        { value: 'tier', label: 'Tier' },
                        { value: 'provider', label: 'Provider' },
                        { value: 'category', label: 'Category' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onFiltersChange({ ...filters, sortBy: option.value })}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            filters.sortBy === option.value
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Order</label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onFiltersChange({ ...filters, sortOrder: 'asc' })}
                            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                              filters.sortOrder === 'asc'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            A → Z
                          </button>
                          <button
                            onClick={() => onFiltersChange({ ...filters, sortOrder: 'desc' })}
                            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                              filters.sortOrder === 'desc'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Z → A
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear</span>
                {activeFilterCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <AnimatePresence>
          {showQuickFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Quick Filters</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterPresets.map((preset, index) => (
                    <motion.button
                      key={preset.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => applyQuickFilter(preset)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-sm ${preset.color}`}
                    >
                      <span className="mr-2">{preset.icon}</span>
                      {preset.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = filters.tags.includes(tag)
                              ? filters.tags.filter(t => t !== tag)
                              : [...filters.tags, tag];
                            onFiltersChange({ ...filters, tags: newTags });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                            filters.tags.includes(tag)
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <EyeIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Active Filters</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.category && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Category: {filters.category}
                          <button
                            onClick={() => onFiltersChange({ ...filters, category: '' })}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.provider && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Provider: {filters.provider}
                          <button
                            onClick={() => onFiltersChange({ ...filters, provider: '' })}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.tier && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Tier: {filters.tier}
                          <button
                            onClick={() => onFiltersChange({ ...filters, tier: '' })}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.access && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Access: {filters.access}
                          <button
                            onClick={() => onFiltersChange({ ...filters, access: '' })}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Tag: {tag}
                          <button
                            onClick={() => {
                              const newTags = filters.tags.filter(t => t !== tag);
                              onFiltersChange({ ...filters, tags: newTags });
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilterBar;
