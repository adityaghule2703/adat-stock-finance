// src/pages/Receipts.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Download, Search, Filter, Eye, Printer, Calendar, DollarSign, User, FileText } from 'lucide-react';

// Clock icon component
const Clock = ({ className, style }) => {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
};

const Receipts = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const receipts = [
    { id: 'RCP-2024-001', date: '2024-01-15', farmer: 'Suresh Patel', crop: 'Wheat', quantity: '500 kg', amount: 25000, status: 'paid', type: 'purchase' },
    { id: 'RCP-2024-002', date: '2024-01-16', farmer: 'Ramesh Kumar', crop: 'Rice', quantity: '300 kg', amount: 18000, status: 'pending', type: 'purchase' },
    { id: 'RCP-2024-003', date: '2024-01-17', buyer: 'AgriCorp Ltd', crop: 'Wheat', quantity: '1000 kg', amount: 55000, status: 'paid', type: 'sale' },
    { id: 'RCP-2024-004', date: '2024-01-18', farmer: 'Amit Singh', crop: 'Corn', quantity: '400 kg', amount: 20000, status: 'paid', type: 'purchase' },
    { id: 'RCP-2024-005', date: '2024-01-19', buyer: 'FoodMills Ltd', crop: 'Rice', quantity: '800 kg', amount: 52000, status: 'pending', type: 'sale' },
  ];

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.farmer && receipt.farmer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.buyer && receipt.buyer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || receipt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pending': return { bg: '#FFF3E0', text: '#FF6F00' };
      default: return { bg: '#E3F2FD', text: '#1565C0' };
    }
  };

  const getTypeColor = (type) => {
    return type === 'purchase' ? '#2E7D32' : '#FF6F00';
  };

  const getTypeText = (type) => {
    return type === 'purchase' ? t('receipts.purchase') : t('receipts.sale');
  };

  const getStatusText = (status) => {
    return status === 'paid' ? t('receipts.paid') : t('receipts.pending');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('receipts.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('receipts.subtitle')}</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
          <Receipt className="w-4 h-4" />
          {t('receipts.generateNew')}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('receipts.totalReceipts')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>24</p>
            </div>
            <FileText className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('receipts.totalAmount')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>₹5,42,000</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('receipts.paidReceipts')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>18</p>
            </div>
            <Receipt className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('receipts.pending')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>6</p>
            </div>
            <Clock className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('receipts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#C8E6C9' }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#C8E6C9' }}
            >
              <option value="all">{t('common.all')}</option>
              <option value="paid">{t('receipts.paid')}</option>
              <option value="pending">{t('receipts.pending')}</option>
            </select>
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9' }}>
              <Filter className="w-4 h-4" style={{ color: '#8D6E63' }} />
              {t('common.moreFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F1F8E9', borderBottom: '1px solid #C8E6C9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.receiptId')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.partyName')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.crop')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.quantity')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>{t('receipts.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt, index) => {
                const statusColors = getStatusColor(receipt.status);
                return (
                  <tr 
                    key={receipt.id} 
                    className="hover:bg-green-50 transition-colors"
                    style={{ 
                      borderBottom: index !== filteredReceipts.length - 1 ? '1px solid #E8F5E9' : 'none'
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{receipt.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                        <span className="text-sm" style={{ color: '#5D4037' }}>{new Date(receipt.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                        <span className="text-sm" style={{ color: '#5D4037' }}>{receipt.farmer || receipt.buyer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: '#5D4037' }}>{receipt.crop}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: '#5D4037' }}>{receipt.quantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>₹{receipt.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ 
                        background: `${getTypeColor(receipt.type)}15`,
                        color: getTypeColor(receipt.type)
                      }}>
                        {getTypeText(receipt.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ 
                        background: statusColors.bg,
                        color: statusColors.text
                      }}>
                        {getStatusText(receipt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="p-1 rounded hover:bg-gray-100 transition-colors" title={t('common.view')}>
                          <Eye className="w-4 h-4" style={{ color: '#8D6E63' }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100 transition-colors" title={t('common.print')}>
                          <Printer className="w-4 h-4" style={{ color: '#8D6E63' }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100 transition-colors" title={t('common.download')}>
                          <Download className="w-4 h-4" style={{ color: '#8D6E63' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Receipts;