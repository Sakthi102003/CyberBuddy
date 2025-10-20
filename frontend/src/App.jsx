import { useEffect, useState, useMemo } from 'react';
import Chatbot from './components/Chatbot';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import { API_BASE_URL } from './config.js';
import { ThemeProvider } from './contexts/ThemeContext';
import { onAuthStateChange, signOutUser } from './firebase/auth';
import { auth } from './firebase/config';
import { useIsMobile } from './hooks/useMediaQuery';
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
  const [chatsLoading, setChatsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [exampleQuestions, setExampleQuestions] = useState([]);
  const isMobile = useIsMobile();

  // Pool of example questions for cybersecurity
  const questionPool = [
    'What is SQL injection?',
    'How to secure my API?',
    'Explain XSS attacks',
    'What is a DDoS attack?',
    'How does HTTPS work?',
    'What is two-factor authentication?',
    'Explain zero-day vulnerabilities',
    'What is a firewall?',
    'How to prevent phishing attacks?',
    'What is end-to-end encryption?',
    'Explain CSRF attacks',
    'What is penetration testing?',
    'How to secure a database?',
    'What are security headers?',
    'Explain man-in-the-middle attacks',
    'What is OAuth 2.0?',
    'How to implement rate limiting?',
    'What is a VPN?',
    'Explain brute force attacks',
    'What is security by obscurity?',
    'How to handle sensitive data?',
    'What is OWASP Top 10?',
    'Explain JWT tokens',
    'What is network segmentation?'
  ];

  // Select 3 random questions when component mounts or user logs in
  useEffect(() => {
    if (user) {
      const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
      setExampleQuestions(shuffled.slice(0, 3));
    }
  }, [user]); // Regenerate when user changes (login/logout)

  // Check for existing login on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        try {
          // Set user data directly from Firebase
          const userData = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            photo_url: firebaseUser.photoURL
          };
          console.log('User data:', userData);
          setUser(userData);
          
          // Wait for Firebase to be fully ready before loading chats
          // Test if we can get a token first
          console.log('Testing token generation...');
          try {
            const testToken = await firebaseUser.getIdToken();
            console.log('Token test successful, length:', testToken.length);
            
            // Now load chats after confirming token works
            console.log('Scheduling chat load in 1 second...');
            setTimeout(() => {
              loadUserChats();
            }, 1000); // Increased to 1 second to ensure everything is ready
          } catch (tokenError) {
            console.error('Token generation failed:', tokenError);
            // Retry after a longer delay
            setTimeout(() => {
              loadUserChats();
            }, 2000);
          }
          
        } catch (error) {
          console.error('Error during authentication:', error);
        }
      } else {
        // User is signed out
        console.log('User signed out, clearing state');
        setUser(null);
        setChats([]);
        setActiveChat(null);
        setSearchQuery('');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Set up token refresh interval - refresh every 50 minutes (Firebase tokens expire after 1 hour)
  useEffect(() => {
    let refreshInterval;
    
    if (user) {
      refreshInterval = setInterval(async () => {
        try {
          await tokenService.getFreshToken();
          console.log('Firebase token refreshed automatically');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }, 50 * 60 * 1000); // 50 minutes
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  const loadUserChats = async () => {
    try {
      console.log('Loading user chats...');
      setChatsLoading(true);
      
      // Ensure we have an authenticated user
      if (!auth.currentUser) {
        console.warn('Cannot load chats: No authenticated user');
        setChatsLoading(false);
        return;
      }
      
      const sessions = await sessionAPI.getSessions();
      console.log('Sessions loaded:', sessions);
      
      // Convert API response to match existing format
      const formattedChats = sessions.map(session => ({
        id: session.id,
        title: String(session.title || 'Untitled Chat'), // Ensure title is always a string
        messages: [], // Will be loaded when needed
        created_at: session.created_at,
        updated_at: session.updated_at
      }));
      
      console.log('Formatted chats:', formattedChats);
      setChats(formattedChats);
      setChatsLoading(false);
    } catch (error) {
      console.error('Failed to load chats:', error);
      setChatsLoading(false);
      // Show user-friendly error
      if (error.message.includes('401') || error.message.includes('authenticated')) {
        console.log('Authentication error - user may need to re-login');
        // Don't show error for auth issues during initial load
      } else {
        console.error('Error loading chats:', error.message);
      }
    }
  };

  const handleLogin = (userData, token) => {
    // Firebase auth state change will handle setting the user
    // This is called from LoginForm but auth state change does the real work
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      // Firebase auth state change will handle clearing user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createNewChat = async (initialMessage = null) => {
    // Handle case where event object is passed (from onClick)
    if (initialMessage && typeof initialMessage !== 'string') {
      initialMessage = null;
    }
    
    // If there's an active chat with only the welcome message, don't create a new one
    const currentChat = getCurrentChat();
    if (currentChat && currentChat.messages.length <= 1 && !initialMessage) {
      return currentChat;
    }

    // Create a placeholder chat with temporary ID that will be replaced when first message is sent
    const tempId = `temp_${Date.now()}`;
    const newChat = {
      id: tempId, // Temporary ID until backend creates the real conversation
      tempId: tempId, // Mark this as temporary
      title: initialMessage ? String(initialMessage.length > 30 ? initialMessage.substring(0, 30) + '...' : initialMessage) : 'New Chat',
      messages: [
        { id: 'welcome', role: 'assistant', content: 'Hello, I am your Cybersecurity assistant. How can I help you today?' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      initialMessage: initialMessage // Store initial message to send after chat is created
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(tempId);
    
    return newChat;
  };

  const updateChatTitle = async (chatId, title) => {
    // Don't try to update title for chats with temporary ID
    if (!chatId || chatId.startsWith('temp_')) {
      console.log('Skipping title update for chat with temporary ID');
      return;
    }
    
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
      // Don't try to delete chats with temporary ID (they don't exist on backend yet)
      if (chatId && !chatId.startsWith('temp_')) {
        await sessionAPI.deleteSession(chatId);
      }
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

  // Replace a temporary chat ID with the real conversation ID from backend
  const replaceTempChatId = (tempId, realId, messages) => {
    console.log('Replacing temporary chat ID:', tempId, 'with real ID:', realId);
    setChats(prev => prev.map(chat => 
      chat.id === tempId ? { ...chat, id: realId, tempId: undefined, messages } : chat
    ));
    // Update active chat if this is the current one
    if (activeChat === tempId) {
      setActiveChat(realId);
    }
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat) || null;
  };

  // Memoize the current chat to prevent unnecessary re-renders
  const currentChat = useMemo(() => {
    return chats.find(chat => chat.id === activeChat) || null;
  }, [chats, activeChat]);

  const filteredChats = chats.filter(chat => {
    // Ensure title and messages exist and are valid
    const title = String(chat.title || '');
    const messages = chat.messages || [];
    const query = searchQuery.toLowerCase();
    
    return (
      title.toLowerCase().includes(query) ||
      messages.some(msg => {
        if (!msg || !msg.content) return false;
        const content = String(msg.content);
        return content.toLowerCase().includes(query);
      })
    );
  });

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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex transition-colors duration-200 relative">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:block`}>
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
          onCloseSidebar={() => setIsSidebarOpen(false)}
          refreshChats={loadUserChats}
          loading={chatsLoading}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {activeChat ? chats.find(c => c.id === activeChat)?.title || 'CyberBuddy' : 'CyberBuddy'}
          </h1>
          <div className="w-10 h-10"> {/* Spacer for centering */}
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {activeChat ? (
            <Chatbot 
              chat={currentChat}
              updateChatMessages={updateChatMessages}
              updateChatTitle={updateChatTitle}
              replaceTempChatId={replaceTempChatId}
              isMobile={isMobile}
            />
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 max-w-2xl px-6 py-8 animate-fadeIn">
              {/* Logo/Icon */}
              <div className="mb-8 inline-block">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CyberBuddy
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-gray-600 dark:text-gray-300">
                Your AI-powered cybersecurity assistant
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Learn Security</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get expert advice on cybersecurity topics</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Get Solutions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find answers to security challenges</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Stay Updated</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latest trends and threats</p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={createNewChat}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full sm:w-auto text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Start New Chat
                </span>
              </button>

              {/* Example Queries */}
              <div className="mt-8 text-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-gray-500 dark:text-gray-400">Try asking:</p>
                  <button
                    onClick={() => {
                      const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
                      setExampleQuestions(shuffled.slice(0, 3));
                    }}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Refresh questions"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {exampleQuestions.map((query) => (
                    <button
                      key={query}
                      onClick={() => {
                        createNewChat(query);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-xs hover:scale-105 transform duration-200 shadow-sm hover:shadow-md"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
