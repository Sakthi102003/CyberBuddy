import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { tokenService } from '../utils/api';

export default function DebugPanel({ user, chats }) {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const collectDebugInfo = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email
      } : null,
      chatsCount: chats?.length || 0,
      chats: chats?.map(chat => ({
        id: chat.id,
        title: chat.title,
        messageCount: chat.messages?.length || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      })) || [],
      apiUrl: API_BASE_URL,
      hasToken: !!tokenService.getToken(),
      tokenPrefix: tokenService.getToken()?.substring(0, 20) + '...' || 'No token',
      localStorage: {
        authToken: !!localStorage.getItem('auth_token'),
        keys: Object.keys(localStorage).filter(key => key.startsWith('chatbot_') || key.startsWith('auth_'))
      },
      environment: {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent.substring(0, 100) + '...'
      }
    };
    
    setDebugInfo(info);
  };

  const copyToClipboard = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          collectDebugInfo();
        }}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm opacity-50 hover:opacity-100"
        title="Debug Info"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Debug Information</h3>
          <div className="flex gap-2">
            <button
              onClick={collectDebugInfo}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
            >
              Refresh
            </button>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
            >
              Copy
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {debugInfo ? (
            <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Collecting debug information...</p>
          )}
        </div>
      </div>
    </div>
  );
}
