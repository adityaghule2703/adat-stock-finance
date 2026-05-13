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

  // Add print event listeners to hide sidebar and header when printing
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('printing');
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('printing');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div style={{ background: '#F5F5DC' }} className="print:bg-white"> {/* Warm earthy background */}
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
        className={`lg:ml-72 mt-16 p-4 sm:p-6 lg:p-8 transition-all duration-300 print:p-0 print:m-0 ${
          isMobileSidebarOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100'
        }`}
        style={{ 
          overflowY: isMobileSidebarOpen ? 'hidden' : 'auto',
          maxHeight: 'calc(100vh - 64px)',
          overflowX: 'hidden'
        }}
      >
        <div className="max-w-7xl mx-auto print:max-w-none print:mx-0">
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