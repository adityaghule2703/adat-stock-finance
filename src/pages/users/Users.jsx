// src/pages/users/Users.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users as UsersIcon,
  Search,
  Filter,
  Eye,
  Plus,
  Loader,
  AlertCircle,
  X,
  MoreVertical,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Banknote,
  Trash2
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Users = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    superadminCount: 0,
    operatorCount: 0,
    vendorCount: 0,
    activeCount: 0
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedUserForMenu, setSelectedUserForMenu] = useState(null);
  const [modalError, setModalError] = useState(null);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.role !== 'all') queryParams.append('role', filters.role);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await fetch(`${BASE_URL}/auth/all?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
        
        // Calculate stats
        const totalUsers = data.data.length;
        const superadminCount = data.data.filter(u => u.role === 'superadmin').length;
        const operatorCount = data.data.filter(u => u.role === 'operator').length;
        const vendorCount = data.data.filter(u => u.role === 'vendor').length;
        const activeCount = data.data.filter(u => u.isActive).length;
        
        setStats({
          totalUsers: data.pagination.total || totalUsers,
          superadminCount,
          operatorCount,
          vendorCount,
          activeCount
        });
      } else {
        setError(data.message || t('users.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.role, filters.status, navigate, t]);

  // Delete user
const handleDeleteUser = async () => {
  if (!selectedUserForMenu) return;
  
  setDeletingUser(true);
  setModalError(null);
  
  try {
    const token = getToken();
    // Fix: Add '/users' to the URL path
    const response = await fetch(`${BASE_URL}/auth/users/${selectedUserForMenu.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.clear();
      navigate('/login');
      return;
    }

    const data = await response.json();

    if (data.success) {
      setShowDeleteModal(false);
      setSelectedUserForMenu(null);
      fetchUsers();
    } else {
      setModalError(data.message || t('users.errors.deleteFailed'));
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    setModalError(t('common.networkError'));
  } finally {
    setDeletingUser(false);
  }
};

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ role: 'all', status: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'superadmin':
        return { bg: '#E8F5E9', text: '#2E7D32', label: t('users.roles.superadmin'), icon: Shield };
      case 'operator':
        return { bg: '#E3F2FD', text: '#1976D2', label: t('users.roles.operator'), icon: User };
      case 'vendor':
        return { bg: '#FFF3E0', text: '#FF6F00', label: t('users.roles.vendor'), icon: Building };
      default:
        return { bg: '#FAFAFA', text: '#8D6E63', label: role, icon: User };
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return { bg: '#E8F5E9', text: '#2E7D32', label: t('users.status.active'), icon: CheckCircle };
    }
    return { bg: '#FFEBEE', text: '#D32F2F', label: t('users.status.inactive'), icon: XCircle };
  };

  const handleActionMenuOpen = (event, user) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedUserForMenu(null);
  };

  const openDeleteModal = (user) => {
    setSelectedUserForMenu(user);
    setModalError(null);
    setShowDeleteModal(true);
    setActionMenuAnchor(null);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setSelectedUserForMenu(null);
    setModalError(null);
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 120; // Reduced since only 2 items
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('users.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('users.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('users.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('users.stats.totalUsers')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalUsers}</p>
            </div>
            <UsersIcon className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('users.stats.superadmins')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.superadminCount}</p>
            </div>
            <Shield className="w-8 h-8" style={{ color: '#7B1FA2' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('users.stats.operators')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.operatorCount}</p>
            </div>
            <User className="w-8 h-8" style={{ color: '#1976D2' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('users.stats.activeUsers')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchUsers} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" /> {t('common.filter')}
              {(filters.role !== 'all' || filters.status !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/users/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" /> {t('users.buttons.addNewUser')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('users.filters.role')}</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allRoles')}</option>
                  <option value="superadmin">{t('users.roles.superadmin')}</option>
                  <option value="operator">{t('users.roles.operator')}</option>
                  <option value="vendor">{t('users.roles.vendor')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('users.filters.status')}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allStatus')}</option>
                  <option value="active">{t('users.status.active')}</option>
                  <option value="inactive">{t('users.status.inactive')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.clearAll')}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('users.noUsersFound')}</p>
            {(searchTerm || filters.role !== 'all' || filters.status !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.contact')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.role')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.business')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.lastLogin')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('users.table.actions')}</th>
                   </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const roleBadge = getRoleBadge(user.role);
                    const RoleIcon = roleBadge.icon;
                    const statusBadge = getStatusBadge(user.isActive);
                    const StatusIcon = statusBadge.icon;
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedUserForMenu?.id === user.id;
                    
                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== users.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{user.name}</p>
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{user.email}</p>
                            </div>
                          </div>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" style={{ color: '#8D6E63' }} />
                              <span className="text-sm" style={{ color: '#5D4037' }}>{user.phone}</span>
                            </div>
                          )}
                          {!user.phone && <span className="text-xs text-gray-400">{t('users.noPhone')}</span>}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: roleBadge.bg,
                            color: roleBadge.text
                          }}>
                            <RoleIcon className="w-3 h-3" />
                            {roleBadge.label}
                          </span>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm" style={{ color: '#5D4037' }}>{user.businessName || '-'}</p>
                            {(user.city || user.state) && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>
                                {user.city}{user.city && user.state ? ', ' : ''}{user.state}
                              </p>
                            )}
                          </div>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: statusBadge.bg,
                            color: statusBadge.text
                          }}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs" style={{ color: '#8D6E63' }}>
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('users.neverLogged')}
                          </span>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, user)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {/* Dropdown menu */}
                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '200px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 140,
                              }}
                            >
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  navigate(`/users/view/${user.id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                              </button>
                            </div>
                          )}
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('users.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.previous')}
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className="w-8 h-8 rounded border text-sm transition-all"
                          style={{
                            borderColor: '#C8E6C9',
                            background: pagination.page === pageNum ? '#2E7D32' : 'white',
                            color: pagination.page === pageNum ? 'white' : '#2E7D32'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUserForMenu && (
        <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={() => closeModal()}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>
                    {t('users.modals.delete.title')}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>
                    {t('users.modals.delete.subtitle')}
                  </p>
                </div>
                <button onClick={() => closeModal()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-8 h-8" style={{ color: '#D32F2F' }} />
                  </div>
                </div>

                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  </div>
                )}

                <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
                  {t('users.modals.delete.confirmMessage', { name: selectedUserForMenu.name })}
                </p>
                <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
                  {t('users.modals.delete.warningMessage')}
                </p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => closeModal()}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 bg-red-600"
                >
                  {deletingUser ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.deleting')}...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> {t('common.delete')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleActionMenuClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        />
      )}
    </div>
  );
};

export default Users;