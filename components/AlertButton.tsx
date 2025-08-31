
import React from 'react';

interface AlertButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const AlertButton: React.FC<AlertButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 bg-red-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg shadow-red-600/30 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-red-800/50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      SEND URGENT ALERT
    </button>
  );
};

export default AlertButton;
