// API base URL - Import from config for proper environment handling
import { API_BASE_URL } from '../config.js';
import { auth } from '../firebase/config.js';

// Auth token management with automatic refresh
export const tokenService = {
  // Get fresh Firebase ID token
  getFreshToken: async () => {
    try {
      // Check if we have a Firebase user for Firebase auth
      if (auth.currentUser) {
        console.log('Getting fresh Firebase ID token...');
        // Get Firebase ID token directly - backend verifies it with Firebase Admin SDK
        const idToken = await auth.currentUser.getIdToken(true);
        console.log('Fresh Firebase ID token obtained');
        return idToken;
      }
      
      console.log('No Firebase user available');
      return null;
    } catch (error) {
      console.error('Error getting fresh token:', error);
      return null;
    }
  },
  
  getAuthHeaders: async () => {
    try {
      console.log('Getting auth headers...');
      // Get Firebase ID token directly
      const token = await tokenService.getFreshToken();
      if (token) {
        console.log('Using Firebase ID token for auth headers');
        return { 'Authorization': `Bearer ${token}` };
      } else {
        console.log('No token available');
        return {};
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {};
    }
  }
};

// Helper function to make API calls with automatic token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
  try {
    console.log('Making authenticated request to:', url);
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated');
    }
    
    // Get fresh auth headers
    const authHeaders = await tokenService.getAuthHeaders();
    console.log('Auth headers obtained:', authHeaders.Authorization ? `Bearer token present (${authHeaders.Authorization.substring(0, 30)}...)` : 'No token');
    
    if (!authHeaders.Authorization) {
      console.error('Failed to get authorization token');
      throw new Error('Failed to get authentication token');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    });

    console.log('Response status:', response.status);

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
      
      console.log('Retry response status:', retryResponse.status);
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
  getCurrentUser: async () => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/user/me`);
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return response.json();
  }
};

// API service for chat conversations (formerly sessions)
export const sessionAPI = {
  // Create a new conversation (not needed - created automatically on first message)
  createSession: async (title = 'New Chat') => {
    // The new backend creates conversations automatically when sending first message
    // Return a placeholder that will be replaced when first message is sent
    return { 
      id: null, 
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Get all conversations
  getSessions: async () => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/conversations`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get conversations');
    }
    
    return response.json();
  },

  // Update conversation (not supported in new backend - conversations auto-update)
  updateSession: async (sessionId, title) => {
    console.log('sessionAPI.updateSession called with:', { sessionId, title });
    
    // The new backend doesn't have an update conversation endpoint
    // Conversations are auto-named based on first message
    // We'll just update locally and not throw an error
    console.log('Note: Backend auto-generates conversation titles, skipping update');
    return { id: sessionId, title };
  },

  // Delete a conversation
  deleteSession: async (sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/conversations/${sessionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete conversation');
    }
    
    return response.json();
  },

  // Get messages in a conversation
  getMessages: async (sessionId) => {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/conversations/${sessionId}/messages`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get messages');
    }
    
    return response.json();
  }
};

// API service for chat
export const chatAPI = {
  sendMessage: async (message, conversationId = null, retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds
    
    try {
      const body = { message };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      // Handle rate limit errors with retry
      if (response.status === 429) {
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          console.log(`Rate limit hit. Retrying in ${delay / 1000}s... (attempt ${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return chatAPI.sendMessage(message, conversationId, retryCount + 1);
        } else {
          throw new Error('Gemini API rate limit exceeded. Please wait a moment and try again.');
        }
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }
      
      return response.json();
    } catch (error) {
      // If it's a network error and we haven't exceeded retries, try again
      if (retryCount < maxRetries && (error.message.includes('fetch') || error.message.includes('network'))) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`Network error. Retrying in ${delay / 1000}s... (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return chatAPI.sendMessage(message, conversationId, retryCount + 1);
      }
      
      throw error;
    }
  },

  // Reset session is not supported in new backend
  // Conversations can be deleted and recreated instead
  resetSession: async (sessionId) => {
    console.log('Note: Reset session not supported, delete conversation instead');
    throw new Error('Reset not supported. Please delete the conversation and start a new one.');
  }
};


