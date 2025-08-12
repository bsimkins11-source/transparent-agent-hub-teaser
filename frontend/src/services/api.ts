import axios from 'axios'
import { Agent } from '../types/agent'

// Filter interfaces for type safety
interface AgentFilters {
  search?: string;
  category?: string;
  provider?: string;
  tier?: string;
  visibility?: string;
}

interface AdminLogFilters {
  level?: string;
  component?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Check and refresh token if needed before each request
  await checkAndRefreshAuth();
  
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('🔄 Token expired, attempting to refresh...');
        
        // For local development, use mock token refresh
        const mockToken = 'local-dev-token-refreshed';
        localStorage.setItem('authToken', mockToken);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${mockToken}`;
        
        console.log('✅ Mock token refreshed, retrying request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear the expired token
        localStorage.removeItem('authToken');
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export const fetchAgents = async (filters?: AgentFilters) => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
  }
  
  const response = await api.get(`/api/agents?${params.toString()}`)
  return response.data
}

export const fetchAgent = async (id: string) => {
  const response = await api.get(`/api/agents/${id}`)
  return response.data.agent
}

export const interactWithAgent = async (agentId: string, message: string, context?: string) => {
  try {
    // Try to make the actual API call
    const response = await api.post(`/api/agents/${agentId}/interact`, {
      message,
      context
    })
    return response.data.response
  } catch (error) {
           // Fallback to mock response if backend is not available
       console.log('ℹ️ Backend not running - using demo mode with mock responses');
    
    // Mock responses for different agents
    if (agentId === 'gemini-chat-agent') {
      const mockResponses = [
        "Hello! I'm Gemini, your AI assistant. I can help you with various tasks, answer questions, and engage in meaningful conversations. What would you like to know?",
        "That's an interesting question! Let me help you with that. I have access to a wide range of information and can assist with creative tasks, research, coding, and general knowledge.",
        "I'm here to help! Whether you need assistance with writing, analysis, problem-solving, or just want to chat, I'm ready to engage. What's on your mind?",
        "Great question! I'm designed to be helpful, informative, and engaging. I can assist with everything from simple queries to complex problem-solving tasks.",
        "I appreciate your message! I'm here to provide helpful, accurate, and engaging responses. How can I assist you today?"
      ];
      
      // Return a random mock response
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      return mockResponses[randomIndex];
    }
    
    // Generic mock response for other agents
    return `Thank you for your message: "${message}". I'm currently in demo mode and will process your request when the backend is available.`;
  }
}

export const fetchCategories = async () => {
  const response = await api.get('/api/agents/categories')
  return response.data.categories
}

export const fetchProviders = async () => {
  const response = await api.get('/api/agents/providers')
  return response.data.providers
}

// Admin API calls
export const fetchAdminAgents = async () => {
  const response = await api.get('/api/admin/agents')
  return response.data.agents
}

export const createAgent = async (agentData: Partial<Agent>) => {
  const response = await api.post('/api/admin/agents', agentData)
  return response.data
}

export const updateAgent = async (id: string, agentData: Partial<Agent>) => {
  const response = await api.put(`/api/admin/agents/${id}`, agentData)
  return response.data
}

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/api/admin/agents/${id}`)
  return response.data
}

export const fetchAdminLogs = async (filters?: AdminLogFilters) => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
  }
  
  const response = await api.get(`/api/admin/logs?${params.toString()}`)
  return response.data.logs
}

export const fetchAdminStats = async () => {
  const response = await api.get('/api/admin/stats')
  return response.data
}

// Utility function to check and refresh authentication
export const checkAndRefreshAuth = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('🔍 No auth token found - user needs to log in');
    return false;
  }
  
  // Check if token is expired (local tokens expire after 1 hour for testing)
  try {
    // Decode the JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      console.log('🔍 Token expired, attempting to refresh...');
      
      try {
        // For local development, use mock token refresh
        const mockToken = 'local-dev-token-refreshed';
        localStorage.setItem('authToken', mockToken);
        console.log('✅ Mock token refreshed successfully');
        return true;
      } catch (refreshError) {
        console.error('❌ Mock token refresh failed:', refreshError);
        localStorage.removeItem('authToken');
        return false;
      }
    }
    
    console.log('✅ Token is valid, expires at:', new Date(payload.exp * 1000));
    return true;
  } catch (error) {
    console.error('❌ Error checking token validity:', error);
    localStorage.removeItem('authToken');
    return false;
  }
};

// User Library Management API calls
export const addAgentToUserLibrary = async (agentId: string, assignmentReason?: string) => {
  console.log('🔍 Debug: addAgentToUserLibrary called with:', {
    agentId,
    assignmentReason
  });
  
  // Try the real API first, fallback to localStorage if it fails
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🚀 Attempting to add agent via API...');
    const response = await api.post(`/api/agents/${agentId}/add-to-library`, {
      assignmentReason
    });
    console.log('✅ addAgentToUserLibrary success via API:', response.data);
    return response.data;
    
  } catch (error) {
    console.log('⚠️ API call failed, using localStorage fallback:', error);
    
    // Fallback to localStorage for immediate testing
    try {
      // Get current user library from localStorage
      const currentUserLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
      
      // Check if agent is already in library
      if (currentUserLibrary.includes(agentId)) {
        throw new Error('This agent is already in your library');
      }
      
      // Add agent to library
      currentUserLibrary.push(agentId);
      localStorage.setItem('userLibrary', JSON.stringify(currentUserLibrary));
      
      // Also store the assignment reason if provided
      if (assignmentReason) {
        const assignmentReasons = JSON.parse(localStorage.getItem('agentAssignmentReasons') || '{}');
        assignmentReasons[agentId] = assignmentReason;
        localStorage.setItem('agentAssignmentReasons', JSON.stringify(assignmentReasons));
      }
      
      console.log('✅ addAgentToUserLibrary success (localStorage fallback):', {
        agentId,
        newLibrary: currentUserLibrary
      });
      
      return {
        success: true,
        agentId,
        message: 'Agent added to library successfully (localStorage)'
      };
    } catch (fallbackError) {
      console.error('❌ Both API and localStorage fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export const removeAgentFromUserLibrary = async (agentId: string) => {
  console.log('🔍 Debug: removeAgentFromUserLibrary called with:', {
    agentId
  });
  
  // Try the real API first, fallback to localStorage if it fails
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🚀 Attempting to remove agent via API...');
    const response = await api.delete(`/api/agents/${agentId}/remove-from-library`);
    console.log('✅ removeAgentFromUserLibrary success via API:', response.data);
    return response.data;
    
  } catch (error) {
    console.log('⚠️ API call failed, using localStorage fallback:', error);
    
    // Fallback to localStorage for immediate testing
    try {
      // Get current user library from localStorage
      const currentUserLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
      
      // Check if agent is in library
      if (!currentUserLibrary.includes(agentId)) {
        throw new Error('Agent not found in your library.');
      }
      
      // Remove agent from library
      const newLibrary = currentUserLibrary.filter((id: string) => id !== agentId);
      localStorage.setItem('userLibrary', JSON.stringify(newLibrary));
      
      // Also remove the assignment reason if it exists
      const assignmentReasons = JSON.parse(localStorage.getItem('agentAssignmentReasons') || '{}');
      delete assignmentReasons[agentId];
      localStorage.setItem('agentAssignmentReasons', JSON.stringify(assignmentReasons));
      
      console.log('✅ removeAgentFromUserLibrary success (localStorage fallback):', {
        agentId,
        newLibrary
      });
      
      return {
        success: true,
        agentId,
        message: 'Agent removed from library successfully (localStorage)'
      };
    } catch (fallbackError) {
      console.error('❌ Both API and localStorage fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export const fetchUserLibrary = async () => {
  try {
    const response = await api.get('/api/agents/user-library');
    return response.data;
  } catch (error) {
    console.error('❌ fetchUserLibrary failed:', {
      error,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to view your library.');
    } else {
      throw new Error(`Failed to fetch user library: ${error.message || 'Unknown error'}`);
    }
  }
};
