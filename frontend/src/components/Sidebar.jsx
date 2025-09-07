import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

export default function Sidebar({ 
  chats, 
  activeChat, 
  setActiveChat, 
  createNewChat, 
  deleteChat, 
  searchQuery, 
  setSearchQuery,
  updateChatTitle,
  user,
  onLogout
}) {
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = () => {
    if (editTitle.trim()) {
      updateChatTitle(editingChat, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 flex flex-col h-screen transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={createNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-500">
            <p>No chats yet</p>
            <p className="text-sm mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  activeChat === chat.id 
                    ? 'bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-600/40' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingChat === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleEditSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        className="w-full bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-200 px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-gray-900 dark:text-gray-200 font-medium text-sm truncate">
                        {chat.title}
                      </h3>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {formatDate(chat.createdAt)}
                    </p>
                    {chat.messages.length > 1 && (
                      <p className="text-gray-700 dark:text-gray-500 text-xs mt-1 truncate">
                        {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(chat);
                      }}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      title="Edit chat title"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <UserProfile user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}
