import { useEffect, useRef, useState } from 'react';
import { chatAPI, sessionAPI } from '../utils/api';
import MarkdownRenderer from './MarkdownRenderer';

export default function Chatbot({ chat, updateChatMessages, updateChatTitle, isMobile = false }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Load messages when chat changes
  useEffect(() => {
    if (chat && !messagesLoaded) {
      loadChatMessages();
    }
  }, [chat, messagesLoaded]);

  const loadChatMessages = async () => {
    if (!chat || messagesLoaded) return;
    
    try {
      const response = await sessionAPI.getMessages(chat.id);
      const formattedMessages = response.messages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role === 'assistant' ? 'bot' : msg.role,
        content: msg.content
      }));
      
      // Add welcome message if no messages exist
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          id: 'welcome',
          role: 'bot',
          content: 'Hello, I am your Cybersecurity assistant. How can I help you today?'
        });
      }
      
      updateChatMessages(chat.id, formattedMessages);
      setMessagesLoaded(true);
    } catch (error) {
      console.error('Failed to load messages:', error);
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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !chat) return;

    const userMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const newMessages = [...chat.messages, userMessage];
    updateChatMessages(chat.id, newMessages);
    setInput('');
    setLoading(true);

    // Auto-update chat title if it's still "New Chat"
    if (chat.title === 'New Chat' && trimmed.length > 0) {
      const title = trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed;
      updateChatTitle(chat.id, title);
    }

    try {
      const response = await chatAPI.sendMessage(trimmed, chat.id);
      const botMessage = { 
        id: crypto.randomUUID(), 
        role: 'bot', 
        content: response.reply || '[No reply returned]' 
      };
      updateChatMessages(chat.id, [...newMessages, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorContent = 'Error: Failed to send message. Please try again.';
      
      if (error.message.includes('Invalid or expired Firebase token')) {
        errorContent = 'Your session has expired. Please refresh the page to log in again.';
      } else if (error.message.includes('401')) {
        errorContent = 'Authentication error. Please refresh the page to log in again.';
      } else if (error.message) {
        errorContent = 'Error: ' + error.message;
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

  if (!chat) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl flex flex-col h-screen">
      {/* Header - Hide on mobile since it's shown in the main header */}
      {!isMobile && (
        <div className="flex justify-center items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
          <div className="text-center">
            <h2 className="text-gray-900 dark:text-gray-200 font-semibold text-lg">{chat.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">CyberBuddy - AI Cybersecurity Assistant</p>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {chat.messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-lg ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white ml-8 sm:ml-12 whitespace-pre-wrap break-words' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-8 sm:mr-12 border border-gray-200 dark:border-gray-700'
            } animate-fade-in transition-colors duration-200`}> 
              {m.role === 'user' ? (
                <span className="whitespace-pre-wrap break-words">{m.content}</span>
              ) : (
                <MarkdownRenderer content={m.content} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm animate-pulse border border-gray-200 dark:border-gray-700 mr-8 sm:mr-12 transition-colors duration-200">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
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
