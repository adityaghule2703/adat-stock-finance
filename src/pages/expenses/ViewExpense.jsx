// src/pages/expenses/ViewExpense.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Printer, Download, Calendar, 
  DollarSign, FileText, Loader, AlertCircle, 
  CheckCircle, XCircle, Clock, Wallet, Truck, 
  Briefcase, Landmark, Warehouse, Building, 
  Wrench, Banknote, Megaphone, UserCheck,
  RefreshCw, CreditCard, Receipt, Hash, Phone,
  Check, X, Ban, IndianRupee
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewExpense = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reason, setReason] = useState('');

  const getToken = () => localStorage.getItem('token');

  const fetchExpenseDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setExpense(data.data);
        setError(null);
      } else {
        setError(data.message || t('expenses.errors.fetchFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExpenseDetails();
  };

  useEffect(() => { 
    fetchExpenseDetails(); 
  }, [id]);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await fetchExpenseDetails();
      } else {
        setError(data.message || t('expenses.errors.approveFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError(t('expenses.errors.reasonRequired'));
      return;
    }
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowRejectModal(false);
        setReason('');
        await fetchExpenseDetails();
      } else {
        setError(data.message || t('expenses.errors.rejectFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError(t('expenses.errors.reasonRequired'));
      return;
    }
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/cancel`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowCancelModal(false);
        setReason('');
        await fetchExpenseDetails();
      } else {
        setError(data.message || t('expenses.errors.cancelFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
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
      minute: '2-digit', 
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPaymentMethodDetails = (method) => {
    const methods = {
      cash: { icon: Wallet, color: '#2E7D32', bg: '#E8F5E9', label: 'Cash', border: '#C8E6C9' },
      upi: { icon: CreditCard, color: '#1976D2', bg: '#E3F2FD', label: 'UPI', border: '#BBDEFB' },
      bank: { icon: Banknote, color: '#F57C00', bg: '#FFF3E0', label: 'Bank Transfer', border: '#FFE0B2' },
      cheque: { icon: Receipt, color: '#7B1FA2', bg: '#F3E5F5', label: 'Cheque', border: '#E1BEE7' }
    };
    return methods[method?.toLowerCase()] || { icon: Wallet, color: '#8D6E63', bg: '#FAFAFA', label: 'Other', border: '#EEEEEE' };
  };

  const categoryOptions = {
    transport_logistics: { label: t('expenses.categories.transport'), icon: Truck, color: '#1565C0', bg: '#E3F2FD' },
    labour_wages: { label: t('expenses.categories.labour'), icon: Briefcase, color: '#2E7D32', bg: '#E8F5E9' },
    market_fees: { label: t('expenses.categories.marketFees'), icon: Landmark, color: '#F57C00', bg: '#FFF3E0' },
    storage_cold_chain: { label: t('expenses.categories.storage'), icon: Warehouse, color: '#7B1FA2', bg: '#F3E5F5' },
    shop_office: { label: t('expenses.categories.shopOffice'), icon: Building, color: '#C2185B', bg: '#FCE4EC' },
    repairs_maintenance: { label: t('expenses.categories.repairs'), icon: Wrench, color: '#D32F2F', bg: '#FFEBEE' },
    banking_finance: { label: t('expenses.categories.banking'), icon: Banknote, color: '#00838F', bg: '#E0F7FA' },
    marketing_misc: { label: t('expenses.categories.marketing'), icon: Megaphone, color: '#FF6F00', bg: '#FFF3E0' }
  };

  const getStatusDetails = (status) => {
    switch(status) {
      case 'approved':
        return { icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', label: t('expenses.status.approved'), border: '#C8E6C9' };
      case 'auto_approved':
        return { icon: CheckCircle, color: '#1B5E20', bg: '#C8E6C9', label: t('expenses.status.autoApproved'), border: '#A5D6A7' };
      case 'pending':
        return { icon: Clock, color: '#FF6F00', bg: '#FFF3E0', label: t('expenses.status.pending'), border: '#FFE0B2' };
      case 'rejected':
        return { icon: XCircle, color: '#D32F2F', bg: '#FFEBEE', label: t('expenses.status.rejected'), border: '#FFCDD2' };
      case 'cancelled':
        return { icon: Ban, color: '#8D6E63', bg: '#FAFAFA', label: t('expenses.status.cancelled'), border: '#EEEEEE' };
      default:
        return { icon: AlertCircle, color: '#1976D2', bg: '#E3F2FD', label: status || t('common.unknown'), border: '#BBDEFB' };
    }
  };

  if (loading && !expense) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('expenses.loading')}</span>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error || t('expenses.errors.notFound')}</p>
          <button 
            onClick={() => navigate('/expenses')} 
            className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105"
            style={{ background: '#2E7D32' }}
          >
            {t('common.backToExpenses')}
          </button>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(expense.status || expense.approvalStatus);
  const StatusIcon = statusDetails.icon;
  const categoryInfo = categoryOptions[expense.category] || { 
    label: expense.category?.replace(/_/g, ' ') || t('common.other'), 
    icon: Wallet,
    color: '#8D6E63',
    bg: '#FAFAFA'
  };
  const CategoryIcon = categoryInfo.icon;
  const paymentMethodDetails = getPaymentMethodDetails(expense.paidBy);
  const PaymentIcon = paymentMethodDetails.icon;
  
  const canApprove = expense.status === 'pending';
  const canReject = expense.status === 'pending';
  const canCancel = ['pending', 'approved', 'auto_approved'].includes(expense.status);

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/expenses')} 
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              {t('expenses.detailsTitle')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('expenses.id')}: {expense._id?.slice(-8)}
            </p>
          </div>
        </div>
      
      </div>

      {/* Status Banner */}
      <div 
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{ borderLeft: `4px solid ${statusDetails.color}` }}
      >
        <div className="p-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: statusDetails.bg }}
            >
              <StatusIcon className="w-6 h-6" style={{ color: statusDetails.color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: statusDetails.color }}>
                {t('common.status')}
              </p>
              <p className="text-xl font-bold" style={{ color: statusDetails.color }}>
                {statusDetails.label}
              </p>
              {expense.approvedBy && (
                <p className="text-xs mt-1" style={{ color: statusDetails.color }}>
                  {t('expenses.approvedBy')}: {expense.approvedBy?.name || t('common.system')}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('expenses.amount')}</p>
            <p className="text-3xl font-bold" style={{ color: '#E65100' }}>
              {formatCurrency(expense.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons for Pending Expenses */}
      {(canApprove || canReject) && (
        <div className="flex gap-3 justify-end">
          {canApprove && (
            <button 
              onClick={handleApprove} 
              disabled={updating} 
              className="px-5 py-2.5 rounded-lg text-white flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: '#2E7D32' }}
            >
              <Check className="w-4 h-4" /> 
              {t('expenses.approve')}
            </button>
          )}
          {canReject && (
            <button 
              onClick={() => setShowRejectModal(true)} 
              disabled={updating} 
              className="px-5 py-2.5 rounded-lg text-white flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: '#D32F2F' }}
            >
              <X className="w-4 h-4" /> 
              {t('expenses.reject')}
            </button>
          )}
        </div>
      )}

      {/* Expense Information Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
              {t('expenses.expenseInformation')}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.category')}</p>
              <div className="mt-1">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: categoryInfo.bg, color: categoryInfo.color }}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {categoryInfo.label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.expenseDate')}</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {formatDate(expense.expenseDate)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.description')}</p>
              <p className="text-base mt-1" style={{ color: '#5D4037' }}>
                {expense.description}
              </p>
            </div>
            {expense.paidTo && (
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.paidTo')}</p>
                <p className="text-base font-medium mt-1" style={{ color: '#1B5E20' }}>
                  <UserCheck className="w-3.5 h-3.5 inline mr-1" style={{ color: '#8D6E63' }} />
                  {expense.paidTo}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
              {t('expenses.paymentDetails')}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.paymentMethod')}</p>
              <div className="mt-1">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ background: paymentMethodDetails.bg, color: paymentMethodDetails.color, borderColor: paymentMethodDetails.border }}
                >
                  <PaymentIcon className="w-4 h-4" />
                  {paymentMethodDetails.label}
                </span>
              </div>
            </div>
            {expense.referenceNumber && (
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.referenceNumber')}</p>
                <p className="text-sm font-mono mt-1" style={{ color: '#5D4037' }}>
                  <Hash className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                  {expense.referenceNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
              Additional Information
            </h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.createdBy')}</p>
              <p className="text-base font-medium mt-1" style={{ color: '#1B5E20' }}>
                {expense.createdBy?.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>
                {expense.createdBy?.email}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.createdAt')}</p>
              <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                {formatDateTime(expense.createdAt)}
              </p>
            </div>
            {expense.approvedAt && (
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.approvedAt')}</p>
                <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                  {formatDateTime(expense.approvedAt)}
                </p>
              </div>
            )}
            {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Last Updated</p>
                <p className="text-base mt-1" style={{ color: '#8D6E63' }}>
                  {formatDateTime(expense.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Card */}
      {expense.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                {t('common.notes')}
              </h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-700 leading-relaxed">{expense.notes}</p>
          </div>
        </div>
      )}

      {/* Remarks Card for Rejection/Cancellation */}
      {(expense.rejectionReason || expense.cancelReason) && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: expense.rejectionReason ? '#D32F2F' : '#8D6E63' }} />
              <h3 className="font-semibold text-lg" style={{ color: expense.rejectionReason ? '#D32F2F' : '#8D6E63' }}>
                {expense.rejectionReason ? t('expenses.rejectionReason') : t('expenses.cancellationReason')}
              </h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-700 leading-relaxed">
              {expense.rejectionReason || expense.cancelReason}
            </p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#D32F2F' }}>
              {t('expenses.rejectExpense')}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
              Please provide a reason for rejection
            </p>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder={t('expenses.rejectionReasonPlaceholder')} 
              rows="4" 
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              style={{ borderColor: '#FFCDD2' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setReason('');
                }} 
                className="flex-1 px-4 py-2 border rounded-lg transition-all hover:bg-gray-50"
                style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleReject} 
                disabled={!reason.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: '#D32F2F' }}
              >
                {t('expenses.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#8D6E63' }}>
              {t('expenses.cancelExpense')}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
              Please provide a reason for cancellation
            </p>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder={t('expenses.cancellationReasonPlaceholder')} 
              rows="4" 
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              style={{ borderColor: '#EEEEEE' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  setReason('');
                }} 
                className="flex-1 px-4 py-2 border rounded-lg transition-all hover:bg-gray-50"
                style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleCancel} 
                disabled={!reason.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: '#8D6E63' }}
              >
                {t('expenses.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpense;