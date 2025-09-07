// Local Storage Keys
const STORAGE_KEYS = {
  USERS: 'chatbot_users',
  CURRENT_USER: 'chatbot_current_user',
  USER_CHATS: 'chatbot_chats_'
};

// User Authentication
export const authService = {
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  isLoggedIn: () => {
    return !!authService.getCurrentUser();
  }
};

// Chat Data Management
export const chatService = {
  getUserChats: (username) => {
    try {
      const chats = localStorage.getItem(STORAGE_KEYS.USER_CHATS + username);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  },

  saveUserChats: (username, chats) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CHATS + username, JSON.stringify(chats));
      return true;
    } catch (error) {
      console.error('Error saving user chats:', error);
      return false;
    }
  },

  addChat: (username, chat) => {
    const chats = chatService.getUserChats(username);
    const updatedChats = [chat, ...chats];
    return chatService.saveUserChats(username, updatedChats);
  },

  updateChat: (username, chatId, updatedChat) => {
    const chats = chatService.getUserChats(username);
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, ...updatedChat } : chat
    );
    return chatService.saveUserChats(username, updatedChats);
  },

  deleteChat: (username, chatId) => {
    const chats = chatService.getUserChats(username);
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    return chatService.saveUserChats(username, updatedChats);
  },

  updateChatMessages: (username, chatId, messages) => {
    const chats = chatService.getUserChats(username);
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, messages, updatedAt: new Date().toISOString() } : chat
    );
    return chatService.saveUserChats(username, updatedChats);
  },

  updateChatTitle: (username, chatId, title) => {
    const chats = chatService.getUserChats(username);
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, title, updatedAt: new Date().toISOString() } : chat
    );
    return chatService.saveUserChats(username, updatedChats);
  }
};

// Storage Management
export const storageService = {
  getStorageUsage: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedMB: (total / 1024 / 1024).toFixed(2)
    };
  },

  clearUserData: (username) => {
    localStorage.removeItem(STORAGE_KEYS.USER_CHATS + username);
  },

  exportUserData: (username) => {
    const user = authService.getCurrentUser();
    const chats = chatService.getUserChats(username);
    
    return {
      user: { username: user.username, email: user.email },
      chats,
      exportDate: new Date().toISOString()
    };
  },

  importUserData: (username, data) => {
    try {
      if (data.chats && Array.isArray(data.chats)) {
        return chatService.saveUserChats(username, data.chats);
      }
      return false;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
};

// Migration and Cleanup
export const migrationService = {
  migrateOldData: () => {
    // This function can be used to migrate data if storage structure changes
    try {
      // Check if there's old data format and migrate it
      return true;
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    }
  },

  cleanup: () => {
    // Clean up orphaned data or old sessions
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
      
      // Remove chat data for users that no longer exist
      for (let key in localStorage) {
        if (key.startsWith(STORAGE_KEYS.USER_CHATS)) {
          const username = key.replace(STORAGE_KEYS.USER_CHATS, '');
          if (!users[username]) {
            localStorage.removeItem(key);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return false;
    }
  }
};
