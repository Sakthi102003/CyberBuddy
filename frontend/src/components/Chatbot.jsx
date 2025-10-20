import { useEffect, useRef, useState } from 'react';
import { chatAPI, sessionAPI } from '../utils/api';
import MarkdownRenderer from './MarkdownRenderer';
import TypingIndicator from './TypingIndicator';
import Toast from './Toast';

export default function Chatbot({ chat, updateChatMessages, updateChatTitle, replaceTempChatId, isMobile = false }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Load messages when chat changes
  useEffect(() => {
    if (chat && !messagesLoaded) {
      loadChatMessages();
    }
  }, [chat, messagesLoaded]);

  // Reset when chat changes
  useEffect(() => {
    setMessagesLoaded(false);
    initialMessageSent.current = false;
  }, [chat?.id]);

  // Auto-send initial message if provided (only once per chat)
  useEffect(() => {
    if (chat && chat.initialMessage && messagesLoaded && !initialMessageSent.current) {
      initialMessageSent.current = true;
      const messageToSend = chat.initialMessage;
      
      // Small delay to ensure UI is ready, then send
      setTimeout(() => {
        sendMessage(messageToSend);
      }, 500);
    }
  }, [chat?.id, messagesLoaded]); // Only depend on chat ID and messagesLoaded, not loading state

  const loadChatMessages = async () => {
    if (!chat || messagesLoaded) return;
    
    // If chat ID is temporary (starts with 'temp_'), it's a new chat that hasn't been created yet
    // Just show the welcome message without trying to load from backend
    if (!chat.id || chat.id.startsWith('temp_')) {
      console.log('New chat with temporary ID, showing welcome message');
      const welcomeMessage = {
        id: 'welcome',
        role: 'bot',
        content: 'Hello, I am your Cybersecurity assistant. How can I help you today?'
      };
      // Only add welcome message if there are no messages yet
      if (!chat.messages || chat.messages.length === 0) {
        updateChatMessages(chat.id, [welcomeMessage]);
      }
      setMessagesLoaded(true);
      return;
    }
    
    console.log('Loading messages for chat:', chat.id);
    
    try {
      // The new backend returns an array of messages directly
      const messages = await sessionAPI.getMessages(chat.id);
      console.log('Messages response:', messages);
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role === 'assistant' ? 'bot' : msg.role,
        content: msg.content
      }));
      
      console.log('Formatted messages:', formattedMessages);
      
      // Add welcome message if no messages exist
      if (formattedMessages.length === 0) {
        console.log('No messages found, adding welcome message');
        formattedMessages.push({
          id: 'welcome',
          role: 'bot',
          content: 'Hello, I am your Cybersecurity assistant. How can I help you today?'
        });
      }
      
      updateChatMessages(chat.id, formattedMessages);
      setMessagesLoaded(true);
      console.log('Messages loaded successfully for chat:', chat.id);
    } catch (error) {
      console.error('Failed to load messages for chat:', chat.id, error);
      
      // Show more specific error information
      if (error.message.includes('401')) {
        console.error('Authentication error while loading messages');
      } else if (error.message.includes('404')) {
        console.error('Chat session not found');
      }
      
      // Fallback: use empty messages with welcome
      const welcomeMessage = {
        id: 'welcome',
        role: 'bot',
        content: 'Hello, I am your Cybersecurity assistant. How can I help you today?'
      };
      updateChatMessages(chat.id, [welcomeMessage]);
      setMessagesLoaded(true);
    }
  };

  // Reset when chat changes
  useEffect(() => {
    setMessagesLoaded(false);
  }, [chat?.id]);

  const sendMessage = async (messageText = null) => {
    const message = messageText || input.trim();
    if (!message || loading || !chat) return;

    const userMessage = { id: crypto.randomUUID(), role: 'user', content: message };
    const newMessages = [...chat.messages, userMessage];
    updateChatMessages(chat.id, newMessages);
    
    // Only clear input if we're using the input field (not auto-sending)
    if (!messageText) {
      setInput('');
    }
    setLoading(true);

    // Auto-update chat title if it's still "New Chat"
    if (chat.title === 'New Chat' && message.length > 0) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      updateChatTitle(chat.id, title);
    }

    try {
      // If chat has temporary ID, don't send it to backend (let backend create new conversation)
      const conversationId = chat.id && !chat.id.startsWith('temp_') ? chat.id : null;
      console.log('Sending message with conversation ID:', conversationId);
      
      const response = await chatAPI.sendMessage(message, conversationId);
      console.log('Chat response:', response);
      
      // The new backend returns { conversation_id, message: { id, role, content, created_at } }
      const botMessage = { 
        id: response.message?.id || crypto.randomUUID(), 
        role: 'bot', 
        content: response.message?.content || response.reply || '[No reply returned]' 
      };
      
      // Update conversation ID if this was a new conversation
      if (response.conversation_id && chat.id !== response.conversation_id) {
        console.log('New conversation created, updating chat ID from', chat.id, 'to', response.conversation_id);
        // Replace the temporary chat with the real conversation
        if (chat.id && chat.id.startsWith('temp_')) {
          replaceTempChatId(chat.id, response.conversation_id, [...newMessages, botMessage]);
        } else {
          // Shouldn't happen, but handle it anyway
          updateChatMessages(response.conversation_id, [...newMessages, botMessage]);
        }
      } else {
        updateChatMessages(chat.id, [...newMessages, botMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorContent = 'Error: Failed to send message. Please try again.';
      
      if (error.message.includes('rate limit')) {
        errorContent = '⚠️ The AI service is experiencing high demand. Please wait a moment and try again. The system will automatically retry your request.';
      } else if (error.message.includes('Invalid or expired Firebase token')) {
        errorContent = '🔒 Your session has expired. Please refresh the page to log in again.';
      } else if (error.message.includes('401')) {
        errorContent = '🔒 Authentication error. Please refresh the page to log in again.';
      } else if (error.message.includes('429')) {
        errorContent = '⚠️ Too many requests. Please wait a few seconds before trying again.';
      } else if (error.message.includes('API key')) {
        errorContent = '⚙️ API configuration error. Please contact the administrator.';
      } else if (error.message) {
        errorContent = '❌ ' + error.message;
      }
      
      const errorMessage = { 
        id: crypto.randomUUID(), 
        role: 'bot', 
        content: errorContent
      };
      updateChatMessages(chat.id, [...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setToast({ message: 'Copied to clipboard!', type: 'success' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      setToast({ message: 'Failed to copy', type: 'error' });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!chat) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl flex flex-col h-screen">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header - Hide on mobile since it's shown in the main header */}
      {!isMobile && (
        <div className="flex justify-center items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <h2 className="text-gray-900 dark:text-gray-200 font-semibold text-lg">{chat.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">CyberBuddy - AI Cybersecurity Assistant</p>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 transition-colors duration-200">
        {chat.messages.map((m, index) => (
          <div 
            key={m.id} 
            className={`flex items-start space-x-3 animate-fadeIn ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-purple-500 to-indigo-600'
            }`}>
              {m.role === 'user' ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 max-w-[80%]">
              <div className={`group relative rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
              }`}>
                {m.role === 'user' ? (
                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{m.content}</p>
                ) : (
                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={m.content} />
                  </div>
                )}
                
                {/* Copy Button for Bot Messages */}
                {m.role === 'bot' && (
                  <button
                    onClick={() => copyToClipboard(m.content, m.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Copy to clipboard"
                  >
                    {copiedId === m.id ? (
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {/* Timestamp */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                {formatTime(m.timestamp || new Date())}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {loading && <TypingIndicator />}
        
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask about threats, vulnerabilities, best practices..."
              className="w-full resize-none rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-0 outline-none text-gray-900 dark:text-gray-200 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 placeholder-gray-500 dark:placeholder-gray-400 min-h-[40px] sm:min-h-[48px] max-h-32 transition-colors duration-200"
              style={{ 
                height: 'auto',
                minHeight: isMobile ? '40px' : '48px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-colors flex items-center justify-center min-w-[60px] sm:min-w-[80px]"
          >
            {loading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
