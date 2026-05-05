// Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Settings, User, ChevronDown, Search, Menu, X, Leaf } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../components/LanguageToggle';

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: t('notifications.newFarmer') || "New farmer registration", time: "5 min ago", read: false, type: "farmer" },
    { id: 2, title: t('notifications.paymentReceived') || "Payment received from buyer", time: "1 hour ago", read: false, type: "payment" },
    { id: 3, title: t('notifications.stockAlert') || "Stock alert: Wheat low", time: "3 hours ago", read: true, type: "stock" },
    { id: 4, title: t('notifications.newOrder') || "New order placed", time: "5 hours ago", read: true, type: "order" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setIsProfileOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 z-20 backdrop-blur-xl" style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}>
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Menu className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg" style={{ color: '#1B5E20' }}>{t('common.appName')}</span>
              <span className="text-xs block" style={{ color: '#6D4C41' }}>{t('common.subtitle')}</span>
            </div>
          </div>

          {/* Mobile Search Button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Search className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#F1F8E9', border: '1px solid #C8E6C9' }}>
            <Search className="w-4 h-4" style={{ color: '#43A047' }} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className="bg-transparent text-sm outline-none w-64 lg:w-80"
              style={{ color: '#2E7D32' }}
            />
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#FFFFFF', color: '#8D6E63' }}>⌘K</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full transition-all duration-300 hover:scale-110" 
                style={{ background: '#F1F8E9' }}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#2E7D32' }} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white" style={{ background: '#FF6F00' }}></span>
              </button>

              {/* Notifications Dropdown Menu */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border overflow-hidden z-30" style={{ borderColor: '#E8F5E9' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E8F5E9' }}>
                    <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{t('notifications.title') || 'Notifications'}</span>
                    <button className="text-xs" style={{ color: '#FF6F00' }}>{t('notifications.markAllRead') || 'Mark all read'}</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-green-50 transition-colors cursor-pointer border-b last:border-0" style={{ borderColor: '#F1F8E9' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: notif.read ? '#C8E6C9' : '#FF6F00' }}></div>
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: notif.read ? '#8D6E63' : '#2E7D32' }}>{notif.title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: '#BCAAA4' }}>{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t text-center" style={{ borderColor: '#E8F5E9' }}>
                    <button className="text-xs" style={{ color: '#FF6F00' }}>{t('notifications.viewAll') || 'View all notifications'}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button className="hidden sm:block p-2 rounded-full transition-all duration-300 hover:scale-110" style={{ background: '#F1F8E9' }}>
              <Settings className="w-5 h-5" style={{ color: '#2E7D32' }} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l cursor-pointer" 
                style={{ borderColor: '#C8E6C9' }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>Rajesh Sharma</p>
                  <p className="text-[10px]" style={{ color: '#FF6F00' }}>{t('account.masterDealer') || 'Master Dealer'}</p>
                </div>
                <div className="relative group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-white rounded-full p-0.5" style={{ background: '#FF6F00' }} />
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border overflow-hidden z-30" style={{ borderColor: '#E8F5E9' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>Rajesh Sharma</p>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>rajesh@agribroker.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-sm text-left hover:bg-green-50 transition-colors" style={{ color: '#2E7D32' }}>
                      {t('profile.myProfile') || 'My Profile'}
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-left hover:bg-green-50 transition-colors" style={{ color: '#2E7D32' }}>
                      {t('profile.accountSettings') || 'Account Settings'}
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-left hover:bg-green-50 transition-colors" style={{ color: '#2E7D32' }}>
                      {t('profile.paymentMethods') || 'Payment Methods'}
                    </button>
                  </div>
                  <div className="border-t py-2" style={{ borderColor: '#E8F5E9' }}>
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-green-50 transition-colors flex items-center justify-between"
                      style={{ color: '#D84315' }}
                    >
                      {isLoggingOut ? (t('common.loggingOut') || 'Logging out...') : (t('common.logout') || 'Logout')}
                      {isLoggingOut && (
                        <svg className="animate-spin h-4 w-4" style={{ color: '#D84315' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="fixed top-16 left-0 right-0 bg-white p-4 shadow-lg z-20 md:hidden" style={{ borderBottom: '1px solid #E8F5E9' }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#F1F8E9', border: '1px solid #C8E6C9' }}>
              <Search className="w-4 h-4" style={{ color: '#2E7D32' }} />
              <input 
                type="text" 
                placeholder={t('common.search')}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#2E7D32' }}
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;