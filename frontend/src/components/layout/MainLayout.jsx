import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-base bg-grid-fade">
      <Header />
      <div className="flex">
        {showSidebar && (
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <Sidebar isOpen />
          </div>
        )}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto w-full px-5 py-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
