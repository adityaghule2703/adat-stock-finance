// src/pages/farmers/FarmerLedger.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, Calendar, Filter, X, Loader, AlertCircle, Download, Printer } from 'lucide-react';
import BASE_URL from '../../config/Config';

const FarmerLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`${BASE_URL}/ledger/farmer/${id}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setFarmer(data.farmer);
        setLedger(data.data || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
      } else {
        setError(data.message || 'Failed to fetch ledger');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLedger(); }, [id, pagination.page, filters]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  if (loading && ledger.length === 0) {
    return <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-green-700" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3"><button onClick={() => navigate(`/farmers/view/${id}`)} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-green-700" /></button><div><h1 className="text-2xl font-bold text-green-900">Farmer Ledger</h1>{farmer && <p className="text-sm text-gray-500">{farmer.name} - {farmer.mobile}</p>}</div></div>
        <div className="flex gap-2"><button className="px-4 py-2 border rounded-lg flex items-center gap-2"><Download className="w-4 h-4" /> Export</button><button className="px-4 py-2 border rounded-lg flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Purchases</p><p className="text-xl font-bold text-green-800">{farmer?.totalPurchases || 0}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Purchase Value</p><p className="text-xl font-bold text-green-800">{formatCurrency(farmer?.totalPurchaseValue)}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Pending Dues</p><p className="text-xl font-bold text-orange-600">{formatCurrency(farmer?.pendingDues)}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Advance Balance</p><p className="text-xl font-bold text-blue-600">{formatCurrency(farmer?.advanceBalance)}</p></div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center"><button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border rounded-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button></div>
        {showFilters && (<div className="mt-4 p-4 border rounded-lg bg-gray-50 flex gap-4"><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="Start Date" /><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="px-3 py-2 border rounded-lg" placeholder="End Date" /><button onClick={() => { setFilters({ startDate: '', endDate: '' }); setPagination(prev => ({ ...prev, page: 1 })); }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Clear</button></div>)}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-green-50"><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Date</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Type</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Description</th><th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Debit</th><th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Credit</th><th className="px-6 py-3 text-right text-xs font-semibold text-green-800">Balance</th></tr></thead>
            <tbody>{ledger.map((entry, idx) => (<tr key={idx} className="border-b border-gray-100 hover:bg-green-50"><td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(entry.entryDate)}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`text-xs px-2 py-1 rounded-full ${entry.transactionType === 'purchase' ? 'bg-purple-100 text-purple-700' : entry.transactionType === 'payment' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{entry.transactionType}</span></td><td className="px-6 py-4 text-sm">{entry.description}</td><td className="px-6 py-4 text-right text-sm text-red-600">{entry.debit ? formatCurrency(entry.debit) : '-'}</td><td className="px-6 py-4 text-right text-sm text-green-600">{entry.credit ? formatCurrency(entry.credit) : '-'}</td><td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(entry.runningBalance)}</td></tr>))}</tbody>
          </table>
        </div>
        {pagination.pages > 1 && (<div className="px-6 py-4 border-t flex justify-between items-center"><div className="text-xs text-gray-500">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div><div className="flex gap-2"><button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button><button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.pages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button></div></div>)}
      </div>
    </div>
  );
};

export default FarmerLedger;