// API base URL - Import from config for proper environment handling
import { API_BASE_URL } from '../config.js';
import { auth } from '../firebase/config.js';

// Auth token management with automatic refresh
export const tokenService = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  
  // Get fresh token with automatic refresh
  getFreshToken: async () => {
    try {
      if (auth.currentUser) {
        // Force refresh token to get a fresh one
        const token = await auth.currentUser.getIdToken(true);
        tokenService.setToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting fresh token:', error);
      return null;
    }
  },
  
  getAuthHeaders: async () => {
    try {
      // Try to get a fresh token
      const token = await tokenService.getFreshToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth headers:', error);
      // Fallback to stored token
      const token = tokenService.getToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
  }
};

// Helper function to make API calls with automatic token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
  try {
    // Get fresh auth headers
    const authHeaders = await tokenService.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    });

    // If we get a 401, try one more time with a fresh token
    if (response.status === 401) {
      console.log('Got 401, refreshing token and retrying...');
      const freshHeaders = await tokenService.getAuthHeaders();
      
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...freshHeaders,
        },
      });
      
      return retryResponse;
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// API service for authentication
export const authAPI = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    return response.json();
  },

  logout: async () => {
    const authHeaders = await tokenService.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
    });
    
    tokenService.removeToken();
    return response.ok;
  },

  getCurrentUser: async () => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return response.json();
  }
};

// API service for chat sessions
export const sessionAPI = {
  createSession: async (title = 'New Chat') => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create session');
    }
    
    return response.json();
  },

  getSessions: async () => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/sessions`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get sessions');
    }
    
    return response.json();
  },

  updateSession: async (sessionId, title) => {
    console.log('sessionAPI.updateSession called with:', { sessionId, title });
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.detail || 'Failed to update session');
    }
    
    const result = await response.json();
    console.log('Update session result:', result);
    return result;
  },

  deleteSession: async (sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete session');
    }
    
    return response.json();
  },

  getMessages: async (sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/sessions/${sessionId}/messages`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get messages');
    }
    
    return response.json();
  }
};

// API service for chat
export const chatAPI = {
  sendMessage: async (message, sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }
    
    return response.json();
  },

  resetSession: async (sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset session');
    }
    
    return response.json();
  }
};


