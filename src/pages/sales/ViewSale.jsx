// src/pages/sales/ViewSale.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, User, Calendar, 
  Package, DollarSign, Phone, FileText, Loader, 
  AlertCircle, CreditCard, Hash, Percent
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchSaleDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/sales/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) setSale(data.data);
      else setError(data.message || 'Failed to fetch sale details');
    } catch (error) {
      console.error('Error fetching sale:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaleDetails(); }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading sale details...</span>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error || 'Sale not found'}</p>
        <button onClick={() => navigate('/sales')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105" style={{ background: '#2E7D32' }}>
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Sale Details</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Invoice: {sale.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50 transition-all hover:scale-105"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50 transition-all hover:scale-105"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm" style={{ color: '#8D6E63' }}>Invoice Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-lg font-semibold" style={{ color: '#2E7D32' }}>Completed</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>Grand Total</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Buyer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Buyer Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Buyer Name</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{sale.buyerName}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
              <p className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
                {sale.buyerMobile}
              </p>
            </div>
            {sale.buyerGst && (
              <div>
                <p className="text-xs text-gray-500 mb-1">GST Number</p>
                <p className="text-base" style={{ color: '#5D4037' }}>{sale.buyerGst}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Sale Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{sale.invoiceNumber}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Sale Date</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{formatDate(sale.saleDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Mode</p>
              <p className="text-base capitalize" style={{ color: '#5D4037' }}>{sale.paymentMode}</p>
              {sale.referenceNumber && (
                <p className="text-xs text-gray-500 mt-1">Ref: {sale.referenceNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Products Sold</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines?.map((line, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm" style={{ color: '#2E7D32' }}>{line.productName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#5D4037' }}>{line.warehouse}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{line.qty}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{line.unit || 'kg'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{formatCurrency(line.sellingPrice)}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-sm" style={{ color: '#FF6F00' }}>
                    {formatCurrency(line.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{ color: '#1B5E20' }}>Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-sm" style={{ color: '#5D4037' }}>Subtotal</span>
            <span className="text-sm font-semibold">{formatCurrency(sale.subTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-sm" style={{ color: '#5D4037' }}>GST ({sale.gstPercent}%)</span>
            <span className="text-sm font-semibold">{formatCurrency(sale.gstAmount)}</span>
          </div>
          <div className="flex justify-between py-3 bg-white rounded-lg px-4 -mx-4 mt-2">
            <span className="text-base font-bold" style={{ color: '#1B5E20' }}>Grand Total</span>
            <span className="text-xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Additional Notes</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: '#5D4037' }}>{sale.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSale;