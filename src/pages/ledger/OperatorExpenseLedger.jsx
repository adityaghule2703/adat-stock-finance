// src/pages/ledger/OperatorExpenseLedger.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Search, Filter, Eye, 
  Download, RefreshCw, Loader, AlertCircle,
  Calendar, DollarSign, TrendingUp, X,
  Truck, Briefcase, Landmark, Warehouse, 
  Building, Wrench, Banknote, Megaphone,
  ArrowLeft, FileText, PieChart, Users
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const OperatorExpenseLedger = () => {
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
    category: 'all'
  });

  const categoryOptions = [
    { value: 'transport_logistics', label: 'Transport & Logistics', icon: Truck },
    { value: 'labour_wages', label: 'Labour & Wages', icon: Briefcase },
    { value: 'market_fees', label: 'Market Fees', icon: Landmark },
    { value: 'storage_cold_chain', label: 'Storage & Cold Chain', icon: Warehouse },
    { value: 'shop_office', label: 'Shop & Office', icon: Building },
    { value: 'repairs_maintenance', label: 'Repairs & Maintenance', icon: Wrench },
    { value: 'banking_finance', label: 'Banking & Finance', icon: Banknote },
    { value: 'marketing_misc', label: 'Marketing & Miscellaneous', icon: Megaphone }
  ];

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

  const fetchExpenseLedger = useCallback(async () => {
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
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      
      const response = await fetch(`${BASE_URL}/ledger/expenses/${operatorId}?${queryParams}`, {
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
        setError(data.message || 'Failed to fetch expense ledger');
      }
    } catch (error) {
      console.error('Error fetching expense ledger:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [operatorId, pagination.page, pagination.limit, filters.startDate, filters.endDate, filters.category, navigate]);

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    if (operatorId) {
      fetchExpenseLedger();
    }
  }, [operatorId, fetchExpenseLedger]);

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

  const getCategoryLabel = (category) => {
    const found = categoryOptions.find(c => c.value === category);
    return found?.label || category?.replace(/_/g, ' ') || 'Other';
  };

  const getCategoryIcon = (category) => {
    const found = categoryOptions.find(c => c.value === category);
    return found?.icon || Wallet;
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', category: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

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
            <h1 className="text-2xl font-bold text-green-900">Operator Expense Ledger</h1>
            <p className="text-sm text-gray-500">Track all expenses by operator</p>
          </div>
        </div>
        <button onClick={() => { fetchExpenseLedger(); }} className="px-4 py-2 rounded-lg border flex items-center gap-2 hover:bg-gray-50">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-green-800">{formatCurrency(ledger.summary?.totalExpenses)}</p></div>
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Transaction Count</p><p className="text-2xl font-bold text-green-800">{ledger.summary?.transactionCount || 0}</p></div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Categories</p><p className="text-2xl font-bold text-green-800">{Object.keys(ledger.summary?.categoryBreakdown || {}).length}</p></div>
                <PieChart className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {ledger.summary?.categoryBreakdown && Object.keys(ledger.summary.categoryBreakdown).length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(ledger.summary.categoryBreakdown).map(([category, amount]) => {
                  const CategoryIcon = getCategoryIcon(category);
                  return (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{getCategoryLabel(category)}</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                  <div><label className="block text-xs font-medium text-green-800 mb-1">Category</label><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="all">All Categories</option>{categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                </div>
                <div className="flex justify-end gap-2 mt-4"><button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm text-red-600">Clear All</button><button onClick={() => setShowFilters(false)} className="px-3 py-1 rounded-lg bg-green-700 text-white text-sm">Apply Filters</button></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-700" /></div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12"><Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No expense transactions found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Created By</th>
                       </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, idx) => {
                        const CategoryIcon = getCategoryIcon(txn.category);
                        return (
                          <tr key={txn._id || idx} className="border-b border-gray-100 hover:bg-green-50">
                            <td className="px-6 py-4 text-sm">{formatDate(txn.expenseDate || txn.createdAt)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{getCategoryLabel(txn.category)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{txn.description}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">{formatCurrency(txn.amount)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{txn.referenceNumber || '-'}</td>
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

export default OperatorExpenseLedger;