// src/pages/budget/BudgetAlertsStatus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, DollarSign, TrendingUp, TrendingDown, AlertCircle,
  RefreshCw, Loader, Calendar, ArrowLeft, PieChart, CheckCircle
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const BudgetAlertsStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const getToken = () => localStorage.getItem('token');

  const fetchBudgetStatus = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/budget-alerts/status?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.message || 'Failed to fetch budget status');
      }
    } catch (error) {
      console.error('Error fetching budget status:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, navigate]);

  useEffect(() => { fetchBudgetStatus(); }, [fetchBudgetStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetStatus();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const categoryLabels = {
    transport_logistics: 'Transport & Logistics',
    labour_wages: 'Labour & Wages',
    market_fees: 'Market Fees',
    storage_cold_chain: 'Storage & Cold Chain',
    shop_office: 'Shop & Office',
    repairs_maintenance: 'Repairs & Maintenance',
    banking_finance: 'Banking & Finance',
    marketing_misc: 'Marketing & Miscellaneous'
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-green-700" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/budget-alerts')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>
          <div><h1 className="text-2xl font-bold text-green-900">Budget Status</h1><p className="text-sm text-gray-500">Monthly budget vs actual expenses</p></div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} /></div>
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 rounded-lg border flex items-center gap-2 hover:bg-gray-50"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
      </div>

      {status && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Total Budget</p><p className="text-2xl font-bold text-green-800">{formatCurrency(status.summary?.totalBudget)}</p></div><Wallet className="w-8 h-8 text-green-600" /></div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Total Spend</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(status.summary?.totalSpend)}</p></div><TrendingDown className="w-8 h-8 text-red-500" /></div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Remaining Budget</p><p className="text-2xl font-bold text-green-800">{formatCurrency(status.summary?.remainingBudget)}</p></div><TrendingUp className="w-8 h-8 text-green-600" /></div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Utilization</p><p className="text-2xl font-bold text-blue-600">{status.summary?.utilizationPercentage}%</p></div><PieChart className="w-8 h-8 text-blue-500" /></div></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50"><h2 className="font-semibold text-green-800">Category-wise Breakdown</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Category</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Budget</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Spent</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Remaining</th><th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Usage</th><th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Status</th></tr></thead>
                <tbody>{status.categories?.map((cat, idx) => {
                  const percentage = cat.percentageUsed || 0;
                  const barColor = percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-green-500';
                  const alertLevel = cat.alertLevel;
                  return (<tr key={idx} className="border-b border-gray-100 hover:bg-green-50"><td className="px-6 py-4 text-sm font-medium text-gray-800">{categoryLabels[cat.category] || cat.category}</td><td className="px-6 py-4 text-right text-sm font-semibold text-green-800">{cat.monthlyLimit > 0 ? formatCurrency(cat.monthlyLimit) : 'Not set'}</td><td className="px-6 py-4 text-right text-sm font-semibold text-orange-600">{formatCurrency(cat.currentSpend)}</td><td className="px-6 py-4 text-right text-sm">{cat.monthlyLimit > 0 ? formatCurrency(cat.remainingBudget) : '-'}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div></div><span className="text-xs text-gray-600 w-12">{percentage}%</span></div></td><td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${alertLevel === 'critical' ? 'bg-red-100 text-red-700' : alertLevel === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{alertLevel === 'critical' ? <AlertCircle className="w-3 h-3" /> : alertLevel === 'warning' ? <TrendingUp className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}{alertLevel === 'critical' ? 'Critical' : alertLevel === 'warning' ? 'Warning' : 'Normal'}</span></td></tr>);
                })}</tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800"><strong>Note:</strong> Budget alerts are triggered when expenses reach 80% (or your custom threshold) of the monthly limit. Categories without a set budget show 0.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetAlertsStatus;