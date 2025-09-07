import { useEffect, useState } from 'react';
import Chatbot from './components/Chatbot';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import { API_BASE_URL } from './config.js';
import { ThemeProvider } from './contexts/ThemeContext';
import { onAuthStateChange, signOutUser } from './firebase/auth';
import { sessionAPI, tokenService } from './utils/api';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Check for existing login on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          firebase_uid: firebaseUser.uid
        };
        
        try {
          // Get Firebase ID token and store it
          const token = await firebaseUser.getIdToken(true); // Force refresh
          tokenService.setToken(token);
          
          setUser(userData);
          loadUserChats();
        } catch (error) {
          console.error('Error getting Firebase token:', error);
          // Still set user but they might need to refresh
          setUser(userData);
        }
      } else {
        // User is signed out
        setUser(null);
        setChats([]);
        setActiveChat(null);
        setSearchQuery('');
        tokenService.removeToken();
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Set up token refresh interval - refresh every 30 minutes
  useEffect(() => {
    let refreshInterval;
    
    if (user) {
      refreshInterval = setInterval(async () => {
        try {
          await tokenService.getFreshToken();
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  const loadUserChats = async () => {
    try {
      const sessions = await sessionAPI.getSessions();
      // Convert API response to match existing format
      const formattedChats = sessions.map(session => ({
        id: session.id,
        title: session.title,
        messages: [], // Will be loaded when needed
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }));
      setChats(formattedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleLogin = (userData, token) => {
    // Firebase auth state change will handle setting the user
    // This is called from LoginForm but auth state change does the real work
    tokenService.setToken(token);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      // Firebase auth state change will handle clearing user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createNewChat = async () => {
    try {
      // If there's an active chat with only the welcome message, don't create a new one
      const currentChat = getCurrentChat();
      if (currentChat && currentChat.messages.length <= 1) {
        return currentChat;
      }

      const response = await sessionAPI.createSession('New Chat');
      
      const newChat = {
        id: response.id,
        title: response.title,
        messages: [
          { id: 'welcome', role: 'assistant', content: 'Hello, I am your Cybersecurity assistant. How can I help you today?' }
        ],
        createdAt: response.created_at,
        updatedAt: response.updated_at
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
      
      return newChat;
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // Fallback: create local chat
      const newChat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: [
          { id: 'welcome', role: 'assistant', content: 'Hello, I am your Cybersecurity assistant. How can I help you today?' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
      return newChat;
    }
  };

  const updateChatTitle = async (chatId, title) => {
    try {
      console.log('Updating chat title:', { chatId, title });
      console.log('API_BASE_URL:', API_BASE_URL);
      
      await sessionAPI.updateSession(chatId, title);
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
      
      console.log('Chat title updated successfully');
    } catch (error) {
      console.error('Failed to update chat title:', error);
      // Show user-friendly error
      alert(`Failed to update chat title: ${error.message}`);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await sessionAPI.deleteSession(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const updateChatMessages = (chatId, messages) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages } : chat
    ));
    // Note: Messages are now saved automatically by the API when sent
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat) || null;
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show main application
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex transition-colors duration-200">
      <Sidebar 
        chats={filteredChats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        updateChatTitle={updateChatTitle}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          {activeChat ? (
            <Chatbot 
              chat={getCurrentChat()}
              updateChatMessages={updateChatMessages}
              updateChatTitle={updateChatTitle}
            />
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 max-w-md">
              <h1 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
                CyberBuddy
              </h1>
              <p className="text-lg mb-6">
                Your AI-powered cybersecurity assistant
              </p>
              <button
                onClick={createNewChat}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
