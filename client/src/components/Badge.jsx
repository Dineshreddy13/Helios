import React from 'react';

const Badge = ({ children, variant = 'member', className = '', ...props }) => {
  const baseClass = variant === 'owner' ? 'badge-owner' : 'badge-member';
  
  return (
    <span className={`badge ${baseClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
