import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card p-6 md:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-xl font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-400 mt-2 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-800 ${className}`}>
      {children}
    </div>
  );
};
