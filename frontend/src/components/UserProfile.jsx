import { useState } from 'react';
import { authService, storageService } from '../utils/localStorage';

export default function UserProfile({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  const handleExportData = () => {
    const data = storageService.exportUserData(user.username);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infosecbuddy-backup-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const storageInfo = storageService.getStorageUsage();

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 w-full"
          title={`Logged in as ${user.username}`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-left min-w-0 flex-1 hidden sm:block">
            <p className="text-gray-900 dark:text-gray-200 text-sm font-medium truncate">{user.username}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{user.email}</p>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showProfile && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-700 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-600 dark:border-gray-600 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-600">
              <p className="text-gray-300 text-sm font-medium">{user.username}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
            
            <div className="px-4 py-2 border-b border-gray-600">
              <p className="text-gray-400 text-xs">Storage used: {storageInfo.usedMB} MB</p>
            </div>

            <button
              onClick={() => {
                setShowExportModal(true);
                setShowProfile(false);
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 dark:bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Export Your Data</h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              This will download a JSON file containing all your chat history and settings. 
              You can use this file to restore your data later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Download
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
