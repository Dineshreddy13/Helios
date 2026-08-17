import React from 'react';
import Navbar from '../components/Navbar';

const Talk = () => {
  return (
    <>
      <Navbar />
      <div className="page-container justify-start pt-8 pb-12 min-h-[calc(100vh-65px)]">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Talk</h1>
          <p className="text-gray-400">Welcome to the Talk page. This is a placeholder for future talks.</p>
        </div>
      </div>
    </>
  );
};

export default Talk;
