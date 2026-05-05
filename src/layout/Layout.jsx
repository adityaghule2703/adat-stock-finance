// Layout.jsx
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div style={{ background: '#F5F5DC' }}> {/* Warm earthy background */}
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar Drawer */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      {/* Main Content - Disabled when mobile sidebar is open */}
      <main 
        className={`lg:ml-72 mt-16 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          isMobileSidebarOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100'
        }`}
        style={{ 
          overflowY: isMobileSidebarOpen ? 'hidden' : 'auto',
          maxHeight: 'calc(100vh - 64px)',
          overflowX: 'hidden'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;