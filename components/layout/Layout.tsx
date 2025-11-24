'use client';
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground transition-colors duration-300">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 relative bg-transparent">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;