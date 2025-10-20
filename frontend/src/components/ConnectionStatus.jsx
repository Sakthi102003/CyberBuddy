import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      // Check root endpoint instead of /api/v1/ 
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('error');
    }
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Error';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
      <span className={getStatusColor()}>{getStatusText()}</span>
      {lastCheck && <span>({lastCheck})</span>}
      {status === 'error' && (
        <button
          onClick={checkConnection}
          className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
}
