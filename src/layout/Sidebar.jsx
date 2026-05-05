// src/layout/Sidebar.jsx
import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Package,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  X,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  UserCog,
  Shield,
  Languages,
  Building2,
  PiggyBank,
} from "lucide-react";

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose && isMobileOpen) {
      onClose();
    }
  }, [location.pathname]);

  const menuItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`;

  const activeStyle = {
    background: 'linear-gradient(135deg, #2E7D32, #43A047)',
    boxShadow: '0 0 20px rgba(46, 125, 50, 0.3)'
  };

  const mainMenu = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/farmers", name: "Farmers", icon: Users },
    { path: "/purchases", name: "Purchases", icon: ShoppingCart },
    { path: "/payments", name: "Payments", icon: CreditCard },
    { path: "/inventory", name: "Inventory", icon: Package },
    { path: "/sales", name: "Sales", icon: ShoppingBag },
    { path: "/reports", name: "Reports", icon: FileText },
    { path: "/expenses", name: "Expenses", icon: Wallet },
    { path: "/users-roles", name: "Users & Roles", icon: UserCog },
    { path: "/settings", name: "Settings", icon: Settings },
  ];

  const sidebarContent = (
    <aside className="h-full flex flex-col overflow-y-auto scrollbar-hide" style={{ background: '#1B3A1F' }}>
      {/* Header with Logo and Close Button for Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: '#2E5A32' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)' }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">AgriBroker</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Gradient Border Top - Desktop only */}
      <div className="hidden lg:block h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF6F00, #FF8F00, #FF6F00)' }}></div>

      {/* Dealer Info Card */}
      <div className="mx-3 sm:mx-5 mt-4 mb-6 p-3 rounded-xl" style={{ background: 'rgba(255, 111, 0, 0.15)', border: '1px solid rgba(255, 111, 0, 0.3)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" style={{ color: '#FF8F00' }} />
          <span className="text-xs font-bold" style={{ color: '#FF8F00' }}>Today's Summary</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400">Buying</p>
            <p className="text-white font-bold">₹1,25,000</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Selling</p>
            <p className="text-white font-bold">₹1,85,000</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255, 111, 0, 0.3)' }}>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-400">Profit</span>
            <span className="text-xs font-bold text-green-400">+₹60,000</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 sm:px-5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-4 px-3" style={{ color: '#FF8F00' }}>
          <span className="inline-block w-1 h-1 rounded-full mr-2" style={{ background: '#FF6F00' }}></span>
          Navigation
        </p>
        <nav className="space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={menuItemClass}
                style={({ isActive }) => isActive ? activeStyle : {}}
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.name === "Purchases" && !isActive && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#FF6F00', color: '#FFFFFF' }}>
                        5
                      </span>
                    )}
                    {item.name === "Payments" && !isActive && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#F44336', color: '#FFFFFF' }}>
                        3
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* AI Insights Card */}
      <div className="mx-3 sm:mx-5 my-6 p-4 rounded-xl" style={{ background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold" style={{ color: '#66BB6A' }}>Market Insights</span>
          <Sparkles className="w-3 h-3" style={{ color: '#FF8F00' }} />
        </div>
        <p className="text-sm text-white mb-3">Wheat prices expected to rise by 8% this week</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2E5A32' }}>
            <div className="h-full w-[68%] rounded-full" style={{ background: 'linear-gradient(90deg, #4CAF50, #66BB6A)' }}></div>
          </div>
          <span className="text-xs font-bold text-white">68%</span>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 sm:px-5 mb-6">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-white/5" style={{ color: '#D84315' }}>
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );

  // For mobile: render as drawer
  if (isMobileOpen !== undefined) {
    return (
      <div className={`fixed top-0 left-0 bottom-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    );
  }

  // For desktop: render as fixed sidebar
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 hidden lg:block">
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;