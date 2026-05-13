// src/pages/ledger/FarmerLedgerDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Search, Filter, Download,
  RefreshCw, Loader, AlertCircle, User, Phone,
  Calendar, DollarSign, TrendingUp, TrendingDown,
  CreditCard, Wallet, X, MoreVertical, Eye,
  FileText
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const FarmerLedgerDetail = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  
  const [farmerData, setFarmerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    entryType: 'all'
  });
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const fetchFarmerLedger = useCallback(async () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.entryType !== 'all') queryParams.append('entryType', filters.entryType);

      const response = await fetch(`${BASE_URL}/ledger/farmers/${farmerId}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFarmerData(data.data.farmer);
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination || {
          page: 1,
          limit: 10,
          total: data.data.transactions?.length || 0,
          pages: Math.ceil((data.data.transactions?.length || 0) / 10)
        });
      } else {
        setError(data.message || 'Failed to fetch farmer ledger');
      }
    } catch (error) {
      console.error('Error fetching farmer ledger:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [farmerId, navigate, pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.entryType]);

  useEffect(() => {
    fetchFarmerLedger();
  }, [fetchFarmerLedger]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', entryType: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchFarmerLedger();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

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

  const getEntryTypeIcon = (type) => {
    switch (type) {
      case 'purchase': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'payment': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'advance_given': return <CreditCard className="w-4 h-4 text-orange-500" />;
      case 'advance_adjusted': return <Wallet className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEntryTypeLabel = (type) => {
    switch (type) {
      case 'purchase': return 'Purchase';
      case 'payment': return 'Payment';
      case 'advance_given': return 'Advance Given';
      case 'advance_adjusted': return 'Advance Adjusted';
      default: return type || 'Transaction';
    }
  };

  const handlePrintReceipt = (transaction) => {
    if (transaction.refModel === 'Purchase' && transaction.refId) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = `/purchases/receipt/${transaction.refId}`;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.print();
          iframe.contentWindow.onafterprint = () => {
            document.body.removeChild(iframe);
          };
        }, 1000);
      };
    } else {
      // Print ledger entry summary
      printLedgerEntry(transaction);
    }
    handleActionMenuClose();
  };

  const printLedgerEntry = (transaction) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ledger Entry - ${farmerData?.name || 'Farmer'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #2E7D32; color: white; }
          .amount { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #2E7D32;">Ledger Transaction Details</h2>
          <h3>${farmerData?.name || 'Farmer'}</h3>
        </div>
        <div class="details">
          <p><strong>Transaction Type:</strong> ${getEntryTypeLabel(transaction.entryType)}</p>
          <p><strong>Date:</strong> ${formatDateTime(transaction.entryDate)}</p>
          <p><strong>Description:</strong> ${transaction.description || 'N/A'}</p>
          <p><strong>Debit (Received):</strong> ${formatCurrency(transaction.debit)}</p>
          <p><strong>Credit (Purchased):</strong> ${formatCurrency(transaction.credit)}</p>
          <p><strong>Running Balance:</strong> ${formatCurrency(transaction.runningBalance)}</p>
        </div>
        <div class="footer">
          <p>Generated on ${formatDateTime(new Date())}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleActionMenuOpen = (event, transaction) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedTransaction(null);
  };

  const getPaginatedTransactions = () => {
    let filtered = [...transactions];
    
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchLower) ||
        getEntryTypeLabel(t.entryType).toLowerCase().includes(searchLower)
      );
    }

    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filtered.slice(start, end);
  };

  const paginatedTransactions = getPaginatedTransactions();
  const totalFiltered = transactions.filter(t => {
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return t.description?.toLowerCase().includes(searchLower) ||
        getEntryTypeLabel(t.entryType).toLowerCase().includes(searchLower);
    }
    return true;
  }).length;
  const totalPages = Math.ceil(totalFiltered / pagination.limit);

  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const MENU_HEIGHT = 150;
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  // Calculate summary
  const summary = {
    totalDebit: transactions.reduce((sum, t) => sum + (t.debit || 0), 0),
    totalCredit: transactions.reduce((sum, t) => sum + (t.credit || 0), 0),
    currentBalance: transactions[transactions.length - 1]?.runningBalance || 0
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ledger')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <User className="w-6 h-6" style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{farmerData?.name || 'Farmer'}</h1>
                {farmerData?.mobile && (
                  <p className="text-sm flex items-center gap-2 mt-1" style={{ color: '#8D6E63' }}>
                    <Phone className="w-3 h-3" /> {farmerData.mobile}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm mt-2" style={{ color: '#8D6E63' }}>Complete transaction history</p>
          </div>
        </div>
        <button
          onClick={fetchFarmerLedger}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:scale-105 transition-all"
          style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Received (Dr)</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.totalDebit)}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Purchased (Cr)</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#D32F2F' }}>{formatCurrency(summary.totalCredit)}</p>
            </div>
            <TrendingDown className="w-8 h-8" style={{ color: '#D32F2F' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Current Balance</p>
              <p className="text-2xl font-bold mt-1" style={{ color: summary.currentBalance >= 0 ? '#2E7D32' : '#D32F2F' }}>
                {formatCurrency(Math.abs(summary.currentBalance))}
                <span className="text-xs ml-1">
                  {summary.currentBalance >= 0 ? '(Dr)' : '(Cr)'}
                </span>
              </p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchFarmerLedger} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder="Search by description or type..."
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
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Transaction Type</label>
                <select
                  value={filters.entryType}
                  onChange={(e) => setFilters({ ...filters, entryType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">All</option>
                  <option value="purchase">Purchase</option>
                  <option value="payment">Payment</option>
                  <option value="advance_given">Advance Given</option>
                  <option value="advance_adjusted">Advance Adjusted</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No transactions found</p>
            {searchTerm && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Debit (Dr)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Credit (Cr)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Balance</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction, index) => {
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedTransaction?._id === transaction._id;
                    
                    return (
                      <tr
                        key={transaction._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== paginatedTransactions.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(transaction.entryDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getEntryTypeIcon(transaction.entryType)}
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                              {getEntryTypeLabel(transaction.entryType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm" style={{ color: '#5D4037' }}>{transaction.description || 'N/A'}</p>
                          {transaction.refId && (
                            <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>Ref: {transaction.refId.slice(-8)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {transaction.debit > 0 ? (
                            <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                              {formatCurrency(transaction.debit)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {transaction.credit > 0 ? (
                            <span className="text-sm font-semibold" style={{ color: '#D32F2F' }}>
                              {formatCurrency(transaction.credit)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold" style={{ color: transaction.runningBalance >= 0 ? '#2E7D32' : '#D32F2F' }}>
                            {formatCurrency(Math.abs(transaction.runningBalance))}
                            <span className="text-xs ml-1">
                              {transaction.runningBalance >= 0 ? 'Dr' : 'Cr'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, transaction)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">Actions</span>
                          </button>

                          {/* Dropdown menu */}
                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '180px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 100,
                              }}
                            >
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  // View details logic
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>

                              {/* Print Receipt/Entry */}
                              <button
                                onClick={() => handlePrintReceipt(transaction)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
                              >
                                <Printer className="w-4 h-4" />
                                Print Entry
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
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, totalFiltered)} of {totalFiltered} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= totalPages - 2) pageNum = totalPages - 4 + i;
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
                    disabled={pagination.page === totalPages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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

export default FarmerLedgerDetail;