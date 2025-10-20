import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import ConnectionStatus from './ConnectionStatus';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

// Chat Item Component
function ChatItem({ 
  chat, 
  activeChat, 
  editingChat, 
  editTitle, 
  setEditTitle,
  handleChatClick, 
  handleEditStart, 
  handleEditSave, 
  handleEditCancel,
  deleteChat,
  formatDate,
  getLastMessage
}) {
  return (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer mb-2 transition-all duration-200 hover:scale-[1.02] ${
        activeChat === chat.id 
          ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border-l-4 border-blue-500 shadow-md' 
          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      onClick={() => handleChatClick(chat.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {editingChat === chat.id && chat.id && !chat.id.startsWith('temp_') ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
              className="w-full bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <h3 className="text-gray-900 dark:text-gray-200 font-medium text-sm truncate mb-1">
                {chat.title}
              </h3>
              {/* Message Preview */}
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {getLastMessage(chat) || 'No messages yet'}
              </p>
            </>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {chat.id && !chat.id.startsWith('temp_') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditStart(chat);
              }}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Edit chat title"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this chat?')) {
                deleteChat(chat.id);
              }
            }}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onLogout,
  onCloseSidebar,
  refreshChats,
  loading
}) {
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const isMobile = useIsMobile();

  const handleEditStart = (chat) => {
    if (!chat.id || chat.id.startsWith('temp_')) {
      return;
    }
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

  // Group chats by date
  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updated_at || chat.created_at);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  // Get last message preview
  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return '';
    const lastMsg = chat.messages[chat.messages.length - 1];
    const content = lastMsg.content || '';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    if (onCloseSidebar && isMobile) {
      onCloseSidebar();
    }
  };

  const groupedChats = groupChatsByDate(chats);

  return (
    <div className="w-full lg:w-80 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-300 dark:border-gray-700 flex flex-col h-screen transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 lg:justify-center">
          <button
            onClick={onCloseSidebar}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          
          <div className="lg:hidden w-9 h-9"></div>
        </div>
        
        {/* Home Button */}
        <button
          onClick={() => {
            setActiveChat(null);
            if (onCloseSidebar && isMobile) {
              onCloseSidebar();
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg font-medium transition-all duration-200 ${
            !activeChat 
              ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </button>
        
        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
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
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium">No chats yet</p>
            <p className="text-sm mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="p-2">
            {groupedChats.today.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Today
                </h4>
                {groupedChats.today.map((chat) => (
                  <ChatItem 
                    key={chat.id}
                    chat={chat}
                    activeChat={activeChat}
                    editingChat={editingChat}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    handleChatClick={handleChatClick}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    deleteChat={deleteChat}
                    formatDate={formatDate}
                    getLastMessage={getLastMessage}
                  />
                ))}
              </div>
            )}

            {groupedChats.yesterday.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Yesterday
                </h4>
                {groupedChats.yesterday.map((chat) => (
                  <ChatItem 
                    key={chat.id}
                    chat={chat}
                    activeChat={activeChat}
                    editingChat={editingChat}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    handleChatClick={handleChatClick}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    deleteChat={deleteChat}
                    formatDate={formatDate}
                    getLastMessage={getLastMessage}
                  />
                ))}
              </div>
            )}

            {groupedChats.lastWeek.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Last 7 Days
                </h4>
                {groupedChats.lastWeek.map((chat) => (
                  <ChatItem 
                    key={chat.id}
                    chat={chat}
                    activeChat={activeChat}
                    editingChat={editingChat}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    handleChatClick={handleChatClick}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    deleteChat={deleteChat}
                    formatDate={formatDate}
                    getLastMessage={getLastMessage}
                  />
                ))}
              </div>
            )}

            {groupedChats.older.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Older
                </h4>
                {groupedChats.older.map((chat) => (
                  <ChatItem 
                    key={chat.id}
                    chat={chat}
                    activeChat={activeChat}
                    editingChat={editingChat}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    handleChatClick={handleChatClick}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    deleteChat={deleteChat}
                    formatDate={formatDate}
                    getLastMessage={getLastMessage}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="mb-2">
          <ConnectionStatus />
        </div>
        <UserProfile user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}
