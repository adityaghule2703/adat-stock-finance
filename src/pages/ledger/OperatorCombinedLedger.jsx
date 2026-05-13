// src/pages/ledger/OperatorCombinedLedger.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Search, Filter, Eye, 
  Download, RefreshCw, Loader, AlertCircle,
  Calendar, DollarSign, TrendingUp, X,
  Truck, ShoppingCart, CreditCard, Users,
  ArrowLeft, FileText, PieChart, TrendingDown
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const OperatorCombinedLedger = () => {
  const navigate = useNavigate();
  const [operatorId, setOperatorId] = useState('');
  const [operators, setOperators] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOperators, setFetchingOperators] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    entryType: 'all'
  });

  const getToken = () => localStorage.getItem('token');

  const fetchOperators = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/auth/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOperators(data.data);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setFetchingOperators(false);
    }
  };

  const fetchCombinedLedger = useCallback(async () => {
    if (!operatorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`${BASE_URL}/ledger/operator/${operatorId}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setLedger(data.data);
        setTransactions(data.data.transactions || []);
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
      } else {
        setError(data.message || 'Failed to fetch combined ledger');
      }
    } catch (error) {
      console.error('Error fetching combined ledger:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [operatorId, pagination.page, pagination.limit, filters.startDate, filters.endDate, navigate]);

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    if (operatorId) {
      fetchCombinedLedger();
    }
  }, [operatorId, fetchCombinedLedger]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getEntryTypeIcon = (type) => {
    switch(type) {
      case 'payment': 
        return { icon: CreditCard, color: '#2E7D32', label: 'Payment to Farmer', bg: '#E8F5E9' };
      case 'expense': 
        return { icon: Truck, color: '#D32F2F', label: 'Expense', bg: '#FFEBEE' };
      case 'sale': 
        return { icon: ShoppingCart, color: '#1976D2', label: 'Sale', bg: '#E3F2FD' };
      default: 
        return { icon: FileText, color: '#8D6E63', label: type || 'Other', bg: '#FAFAFA' };
    }
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', entryType: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const filteredTransactions = filters.entryType === 'all' 
    ? transactions 
    : transactions.filter(t => t.entryType === filters.entryType);

  if (fetchingOperators) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-green-700" />
        <span className="ml-2">Loading operators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-green-900">Operator Combined Ledger</h1>
            <p className="text-sm text-gray-500">Sales + Payments + Expenses - Complete financial overview</p>
          </div>
        </div>
        <button onClick={() => { fetchCombinedLedger(); }} className="px-4 py-2 rounded-lg border flex items-center gap-2 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <label className="block text-xs font-medium mb-1 text-green-800">SELECT OPERATOR</label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none "
            style={{ borderColor: '#C8E6C9' }}
          >
            <option value="">Select an operator</option>
            {operators.map(operator => (
              <option key={operator._id} value={operator.id || operator._id}>
                {operator.name} - {operator.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {operatorId && ledger && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Total Sales</p><p className="text-2xl font-bold text-green-800">{formatCurrency(ledger.summary?.totalSales)}</p></div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-red-600">{formatCurrency(ledger.summary?.totalExpenses)}</p></div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Payments to Farmers</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(ledger.summary?.totalPaymentsToFarmers)}</p></div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Net Profit</p><p className="text-2xl font-bold text-green-800">{formatCurrency(ledger.summary?.netProfit)}</p></div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1"></div>
              <div className="flex gap-2">
                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                  <Filter className="w-4 h-4" /> Filters
                </button>
                <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
              </div>
            </div>
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-medium text-green-800 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-medium text-green-800 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-medium text-green-800 mb-1">Transaction Type</label><select value={filters.entryType} onChange={(e) => setFilters({ ...filters, entryType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="all">All Types</option><option value="payment">Payments to Farmers</option><option value="expense">Expenses</option><option value="sale">Sales</option></select></div>
                </div>
                <div className="flex justify-end gap-2 mt-4"><button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm text-red-600">Clear All</button><button onClick={() => setShowFilters(false)} className="px-3 py-1 rounded-lg bg-green-700 text-white text-sm">Apply Filters</button></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-700" /></div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12"><Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No transactions found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Debit (Out)</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Credit (In)</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Created By</th>
                       </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn, idx) => {
                        const typeInfo = getEntryTypeIcon(txn.entryType);
                        const TypeIcon = typeInfo.icon;
                        return (
                          <tr key={txn._id || idx} className="border-b border-gray-100 hover:bg-green-50">
                            <td className="px-6 py-4 text-sm">{formatDate(txn.entryDate)}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                                <TypeIcon className="w-3 h-3" />
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-green-800">{txn.farmer?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm">{txn.description}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">{txn.debit > 0 ? formatCurrency(txn.debit) : '-'}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">{txn.credit > 0 ? formatCurrency(txn.credit) : '-'}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-blue-600">{formatCurrency(txn.runningBalance)}</td>
                            <td className="px-6 py-4 text-sm">{txn.createdBy?.name || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t flex justify-between items-center">
                    <div className="text-xs text-gray-500">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                      <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.pages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OperatorCombinedLedger;