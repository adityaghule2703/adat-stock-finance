// src/pages/audit/AuditLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Loader,
  AlertCircle,
  X,
  User,
  Calendar,
  Clock,
  Monitor,
  MapPin,
  FileText,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  DollarSign,
  Package,
  Building,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  Plus,
  MoreVertical
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AuditLogs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
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
    startDate: '',
    endDate: '',
    action: 'all',
    entityType: 'all'
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedLogForMenu, setSelectedLogForMenu] = useState(null);

  // Action types with icons and colors
  const actionConfig = {
    'CREATE_PURCHASE': { icon: ShoppingCart, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createPurchase' },
    'UPDATE_PURCHASE': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updatePurchase' },
    'DELETE_PURCHASE': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deletePurchase' },
    'CREATE_SALE': { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.createSale' },
    'UPDATE_SALE': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateSale' },
    'DELETE_SALE': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteSale' },
    'CREATE_EXPENSE': { icon: DollarSign, color: '#F57C00', bg: '#FFF3E0', labelKey: 'audit.actions.createExpense' },
    'UPDATE_EXPENSE': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateExpense' },
    'DELETE_EXPENSE': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteExpense' },
    'CREATE_PAYMENT': { icon: DollarSign, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createPayment' },
    'UPDATE_PAYMENT': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updatePayment' },
    'DELETE_PAYMENT': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deletePayment' },
    'CREATE_FARMER': { icon: Users, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createFarmer' },
    'UPDATE_FARMER': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateFarmer' },
    'DELETE_FARMER': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteFarmer' },
    'ADJUST_STOCK': { icon: Package, color: '#7B1FA2', bg: '#F3E5F5', labelKey: 'audit.actions.adjustStock' },
    'TRANSFER_STOCK': { icon: Package, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.transferStock' },
    'SET_BUDGET': { icon: Settings, color: '#F57C00', bg: '#FFF3E0', labelKey: 'audit.actions.setBudget' },
    'LOGIN': { icon: User, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.login' },
    'LOGOUT': { icon: User, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.logout' },
    'CREATE': { icon: Plus, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.create' },
    'UPDATE': { icon: Edit2, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.update' },
    'DELETE': { icon: Trash2, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.delete' }
  };

  // Entity type config
  const entityConfig = {
    'Purchase': { icon: ShoppingCart, color: '#2E7D32', labelKey: 'audit.entities.purchase' },
    'Sale': { icon: TrendingUp, color: '#1976D2', labelKey: 'audit.entities.sale' },
    'Expense': { icon: DollarSign, color: '#F57C00', labelKey: 'audit.entities.expense' },
    'Payment': { icon: DollarSign, color: '#2E7D32', labelKey: 'audit.entities.payment' },
    'Farmer': { icon: Users, color: '#2E7D32', labelKey: 'audit.entities.farmer' },
    'Inventory': { icon: Package, color: '#7B1FA2', labelKey: 'audit.entities.inventory' },
    'BudgetAlert': { icon: AlertTriangle, color: '#FF6F00', labelKey: 'audit.entities.budgetAlert' },
    'User': { icon: User, color: '#1976D2', labelKey: 'audit.entities.user' }
  };

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

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
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
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.action !== 'all') queryParams.append('action', filters.action);
      if (filters.entityType !== 'all') queryParams.append('entityType', filters.entityType);

      const response = await fetch(`${BASE_URL}/audit?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || t('audit.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.action, filters.entityType, navigate, t]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', action: 'all', entityType: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('audit.timeAgo.justNow');
    if (diffMins < 60) return t('audit.timeAgo.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('audit.timeAgo.hoursAgo', { count: diffHours });
    return t('audit.timeAgo.daysAgo', { count: diffDays });
  };

  const getActionLabel = (action) => {
    const config = actionConfig[action];
    if (config) return t(config.labelKey);
    return action.replace(/_/g, ' ');
  };

  const getEntityLabel = (entityType) => {
    const config = entityConfig[entityType];
    if (config) return t(config.labelKey);
    return entityType || 'N/A';
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
    handleActionMenuClose();
  };

  const handleActionMenuOpen = (event, log) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedLogForMenu(log);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedLogForMenu(null);
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 120;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  // Get unique actions and entity types for filters
  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueEntityTypes = [...new Set(logs.map(log => log.entityType))];

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('audit.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('audit.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('audit.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.stats.totalLogs')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{pagination.total}</p>
            </div>
            <History className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.stats.pages')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{pagination.pages}</p>
            </div>
            <FileText className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.stats.currentPage')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{pagination.page}</p>
            </div>
            <Calendar className="w-8 h-8" style={{ color: '#1976D2' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.stats.perPage')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{pagination.limit}</p>
            </div>
            <Clock className="w-8 h-8" style={{ color: '#7B1FA2' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchLogs} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
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
                placeholder={t('audit.searchPlaceholder')}
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
              {(filters.startDate || filters.endDate || filters.action !== 'all' || filters.entityType !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('audit.filters.startDate')}</label>
                <input 
                  type="date" 
                  value={filters.startDate} 
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('audit.filters.endDate')}</label>
                <input 
                  type="date" 
                  value={filters.endDate} 
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('audit.filters.actionType')}</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allActions')}</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {getActionLabel(action)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('audit.filters.entityType')}</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allEntities')}</option>
                  {uniqueEntityTypes.map(entity => (
                    <option key={entity} value={entity}>
                      {getEntityLabel(entity)}
                    </option>
                  ))}
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

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('audit.noLogsFound')}</p>
            {(searchTerm || filters.startDate || filters.endDate || filters.action !== 'all' || filters.entityType !== 'all') && (
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.time')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.action')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.entity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.ipAddress')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.device')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('audit.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => {
                    const action = actionConfig[log.action] || { icon: FileText, color: '#8D6E63', bg: '#FAFAFA', labelKey: null };
                    const ActionIcon = action.icon;
                    const entity = entityConfig[log.entityType] || { icon: FileText, color: '#8D6E63', labelKey: null };
                    const EntityIcon = entity.icon;
                    const actionLabel = action.labelKey ? t(action.labelKey) : log.action.replace(/_/g, ' ');
                    const entityLabel = entity.labelKey ? t(entity.labelKey) : (log.entityType || 'N/A');
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedLogForMenu?._id === log._id;
                    
                    return (
                      <tr 
                        key={log._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== logs.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{formatDate(log.createdAt)}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{formatTimeAgo(log.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{log.userId?.name || t('audit.unknown')}</p>
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{log.userId?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: action.bg,
                            color: action.color
                          }}>
                            <ActionIcon className="w-3 h-3" />
                            {actionLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <EntityIcon className="w-4 h-4" style={{ color: entity.color }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{entityLabel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{log.ipAddress || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" style={{ color: '#8D6E63' }} />
                            <span className="text-xs" style={{ color: '#8D6E63' }}>
                              {log.deviceInfo?.substring(0, 30)}...
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
  <button
    onClick={() => navigate(`/audit-logs/view/${log._id}`)}
    className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
    style={{ color: '#2E7D32' }}
  >
    <Eye className="w-4 h-4" />
    <span className="text-xs font-medium">View</span>
  </button>
</td>
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
                  {t('audit.pagination.showing', {
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

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div
          className="fixed inset-0 z-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => { setShowDetailsModal(false); setSelectedLog(null); }}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '600px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#2E7D32' }}>{t('audit.modal.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>
                    {formatDateTime(selectedLog.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => { setShowDetailsModal(false); setSelectedLog(null); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="p-3 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
                    <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{t('audit.modal.userInfo')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.name')}:</span>
                      <p className="font-medium" style={{ color: '#1B5E20' }}>{selectedLog.userId?.name || t('audit.unknown')}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.email')}:</span>
                      <p className="font-medium" style={{ color: '#1B5E20' }}>{selectedLog.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.role')}:</span>
                      <p className="font-medium" style={{ color: '#1B5E20' }}>{selectedLog.userId?.role || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Details */}
                <div className="p-3 rounded-lg" style={{ background: '#FFF3E0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" style={{ color: '#FF6F00' }} />
                    <span className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{t('audit.modal.actionDetails')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.action')}:</span>
                      <p className="font-medium" style={{ color: '#5D4037' }}>{getActionLabel(selectedLog.action)}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.entityType')}:</span>
                      <p className="font-medium" style={{ color: '#5D4037' }}>{getEntityLabel(selectedLog.entityType)}</p>
                    </div>
                    {selectedLog.entityId && (
                      <div>
                        <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.entityId')}:</span>
                        <p className="font-medium text-xs" style={{ color: '#5D4037' }}>{selectedLog.entityId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="p-3 rounded-lg" style={{ background: '#E3F2FD' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4" style={{ color: '#1976D2' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1976D2' }}>{t('audit.modal.technicalDetails')}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.ipAddress')}:</span>
                      <p className="font-medium" style={{ color: '#5D4037' }}>{selectedLog.ipAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{t('audit.modal.deviceInfo')}:</span>
                      <p className="text-xs" style={{ color: '#5D4037' }}>{selectedLog.deviceInfo || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedLog.notes && (
                  <div className="p-3 rounded-lg" style={{ background: '#FAFAFA', border: '1px solid #E8F5E9' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{t('audit.modal.notes')}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#5D4037' }}>{selectedLog.notes}</p>
                  </div>
                )}

                {/* After Value */}
                {selectedLog.afterValue && (
                  <div className="p-3 rounded-lg" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#2E7D32' }} />
                      <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{t('audit.modal.changes')}</span>
                    </div>
                    <pre className="text-xs overflow-x-auto p-2 rounded" style={{ background: '#F1F8E9', color: '#1B5E20' }}>
                      {JSON.stringify(selectedLog.afterValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="flex justify-end p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => { setShowDetailsModal(false); setSelectedLog(null); }}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: '#2E7D32' }}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;