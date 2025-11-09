"use client";

import { useState, useEffect } from 'react';

export const BackendStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      setIsOnline(response.ok);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) {
    return (
      <div className="flex items-center space-x-2 text-yellow-400">
        <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
        <span className="text-xs">Checking backend...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} ${isOnline ? 'animate-pulse' : ''}`}></div>
      <span className="text-xs">
        Backend {isOnline ? 'Online' : 'Offline'}
      </span>
      <button 
        onClick={checkBackend}
        className="text-xs opacity-60 hover:opacity-100 underline"
      >
        Refresh
      </button>
    </div>
  );
};