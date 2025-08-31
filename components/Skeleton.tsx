import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  height = 'h-4', 
  width = 'w-full',
  className = '' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-700/50 rounded ${height} ${width} ${className}`}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;
