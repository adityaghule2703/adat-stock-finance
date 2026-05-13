import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import BASE_URL from '../../config/Config';

const PurchaseReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/purchases/${id}/receipt?format=json`, {
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
        setReceiptData(data.data);
      } else {
        setError(data.message || 'Failed to fetch receipt');
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading receipt...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 m-6">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-600">{error}</span>
        <button onClick={fetchReceipt} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
      </div>
    );
  }

  if (!receiptData) return null;

  const business = receiptData.business || {};
  const farmer = receiptData.farmer || {};
  const purchase = receiptData.purchase || {};
  const items = purchase.items || [];
  const deductions = purchase.deductions || {};

  return (
    <div style={{ background: '#e5e5e5', minHeight: '100vh' }}>
      {/* Action Buttons */}
      <div style={{ maxWidth: '210mm', margin: '0 auto 20px auto', textAlign: 'right', paddingTop: '10px' }} className="no-print">
        <button
          onClick={() => navigate('/purchases')}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Back
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: '10px 20px',
            background: '#2E7D32',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <Printer size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Print Receipt
        </button>
      </div>

      {/* A4 PAGE */}
      <div
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: '#fff',
          padding: '12mm 18mm 18mm 18mm',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        }}
        className="print-container"
      >
        {/* Top Design - Without circle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '80px',
            background: '#E8F5E9',
            borderBottomLeftRadius: '80px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '50px',
              width: '180px',
              height: '50px',
              background: 'rgba(46, 125, 50, 0.1)',
              borderRadius: '100px',
              transform: 'rotate(10deg)',
            }}
          />
        </div>

        {/* Header - Reduced margin top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '15px',
            position: 'relative',
            zIndex: 2,
            marginTop: '15px',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#2E7D32',
                fontSize: '32px',
                fontWeight: '700',
              }}
            >
              Logo
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h4
              style={{
                margin: 0,
                color: '#2E7D32',
                fontSize: '18px',
              }}
            >
              {business.name || 'Company Name'}
            </h4>

            <p
              style={{
                margin: '6px 0',
                color: '#6B4C3B',
                fontSize: '11px',
                lineHeight: '18px',
              }}
            >
              {business.address || 'Your office address, 123 St,'}<br />
              {business.city || 'Malaga'}, {business.state || 'Spain'}.<br />
              Tel: {business.phone || '+123 345 567'}<br />
              Email: {business.email || 'info@company.com'}
              {business.gstNumber && <><br />GST: {business.gstNumber}</>}
            </p>
          </div>
        </div>

        {/* Receipt Details - Reduced top margin */}
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <div
              style={{
                background: '#2E7D32',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Receipt No.
            </div>

            <div
              style={{
                background: '#2E7D32',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Receipt Date
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#2E7D32',
                fontWeight: '500',
              }}
            >
              {receiptData.receiptNumber || 'N/A'}
            </div>

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#2E7D32',
                fontWeight: '500',
              }}
            >
              {formatDateTime(receiptData.receiptDate)}
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              background: '#2E7D32',
              color: '#fff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '600',
              width: '160px',
            }}
          >
            Farmer Details
          </div>

          <div
            style={{
              border: '1px solid #C8E6C9',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#2E7D32',
            }}
          >
            <strong>{farmer.name || 'N/A'}</strong>
            {farmer.mobile && <div>Mobile: {farmer.mobile}</div>}
            {(farmer.village || farmer.city) && (
              <div>Village: {farmer.village || ''} {farmer.city ? `, ${farmer.city}` : ''}</div>
            )}
            {farmer.state && <div>State: {farmer.state}</div>}
            {farmer.address && <div>Address: {farmer.address}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          <thead>
            <tr>
              {['DESCRIPTION', 'QTY', 'UNIT', 'RATE (₹)', 'TOTAL (₹)'].map((head, index) => (
                <th
                  key={index}
                  style={{
                    background: '#2E7D32',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '12px',
                    border: '1px solid #C8E6C9',
                    textAlign: index === 0 ? 'left' : 'right',
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: '1px solid #C8E6C9',
                    padding: '10px',
                    fontSize: '12px',
                    color: '#2E7D32',
                  }}
                >
                  {item.productName}
                  {item.notes && <div style={{ fontSize: '10px', color: '#8D6E63', marginTop: '3px' }}>{item.notes}</div>}
                </td>
                <td
                  style={{
                    border: '1px solid #C8E6C9',
                    padding: '10px',
                    fontSize: '12px',
                    color: '#2E7D32',
                    textAlign: 'right',
                  }}
                >
                  {formatNumber(item.quantity)}
                </td>
                <td
                  style={{
                    border: '1px solid #C8E6C9',
                    padding: '10px',
                    fontSize: '12px',
                    color: '#2E7D32',
                    textAlign: 'right',
                  }}
                >
                  {item.unit}
                </td>
                <td
                  style={{
                    border: '1px solid #C8E6C9',
                    padding: '10px',
                    fontSize: '12px',
                    color: '#2E7D32',
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(item.rate)}
                </td>
                <td
                  style={{
                    border: '1px solid #C8E6C9',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#FF6F00',
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: '20px',
          }}
        >
          {/* Left Side - Deductions & Payment Method */}
          <div>
            {/* Deductions Section */}
            {(deductions.transport > 0 || deductions.labour > 0 || deductions.commission > 0 || 
              deductions.storage > 0 || deductions.returnDeduction > 0 || deductions.advanceAdjusted > 0 || 
              deductions.other > 0) && (
              <div
                style={{
                  border: '1px solid #C8E6C9',
                  padding: '10px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontWeight: '600', color: '#2E7D32', marginBottom: '8px', fontSize: '12px' }}>Deductions</div>
                {deductions.transport > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Transport</span>
                    <span>{formatCurrency(deductions.transport)}</span>
                  </div>
                )}
                {deductions.labour > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Labour</span>
                    <span>{formatCurrency(deductions.labour)}</span>
                  </div>
                )}
                {deductions.commission > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Commission ({deductions.commissionType})</span>
                    <span>{formatCurrency(deductions.commission)}</span>
                  </div>
                )}
                {deductions.storage > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Storage {deductions.storageNote && `(${deductions.storageNote})`}</span>
                    <span>{formatCurrency(deductions.storage)}</span>
                  </div>
                )}
                {deductions.returnDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Return {deductions.returnNote && `(${deductions.returnNote})`}</span>
                    <span>{formatCurrency(deductions.returnDeduction)}</span>
                  </div>
                )}
                {deductions.advanceAdjusted > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Advance Adjusted</span>
                    <span>{formatCurrency(deductions.advanceAdjusted)}</span>
                  </div>
                )}
                {deductions.other > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B4C3B', marginBottom: '4px' }}>
                    <span>Other {deductions.otherNote && `(${deductions.otherNote})`}</span>
                    <span>{formatCurrency(deductions.other)}</span>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                marginBottom: '10px',
                fontSize: '12px',
                color: '#6B4C3B',
              }}
            >
              <strong>Payment Method:</strong> {receiptData.payments?.[0]?.mode || 'N/A'}
            </div>

            {receiptData.payments?.[0]?.referenceNumber && (
              <div
                style={{
                  border: '1px solid #C8E6C9',
                  padding: '10px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#6B4C3B',
                }}
              >
                <strong>Transaction No:</strong> {receiptData.payments[0].referenceNumber}
              </div>
            )}

            {/* Terms and Conditions */}
            <div style={{ marginTop: '15px' }}>
              <h4
                style={{
                  color: '#2E7D32',
                  marginBottom: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Terms and Conditions
              </h4>

              <p
                style={{
                  fontSize: '10px',
                  color: '#6B4C3B',
                  lineHeight: '16px',
                }}
              >
                1. Goods once sold will not be taken back.<br />
                2. Payment is due within 30 days of invoice date.<br />
                3. Interest will be charged on overdue payments.<br />
                4. This is a computer generated receipt.
              </p>
            </div>
          </div>

          {/* Right Side - Totals */}
          <div>
            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#2E7D32',
              }}
            >
              <span>Sub Total</span>
              <span>{formatCurrency(purchase.grossTotal)}</span>
            </div>

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                fontSize: '13px',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#2E7D32',
              }}
            >
              <span>Total Deductions</span>
              <span style={{ color: '#D32F2F' }}>-{formatCurrency(purchase.totalDeductions)}</span>
            </div>

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '700',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#FF6F00',
              }}
            >
              <span>Grand Total</span>
              <span>{formatCurrency(purchase.finalPayable)}</span>
            </div>

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                fontSize: '12px',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#2E7D32',
              }}
            >
              <span>Amount Paid</span>
              <span>{formatCurrency(purchase.amountPaid)}</span>
            </div>

            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                fontSize: '12px',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                color: purchase.amountDue > 0 ? '#D32F2F' : '#2E7D32',
                fontWeight: purchase.amountDue > 0 ? '600' : '500',
              }}
            >
              <span>Balance Due</span>
              <span>{formatCurrency(purchase.amountDue)}</span>
            </div>

            {/* Status Badge */}
            <div
              style={{
                border: '1px solid #C8E6C9',
                padding: '10px',
                fontSize: '12px',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                background: purchase.status === 'paid' ? '#E8F5E9' : purchase.status === 'partial' ? '#FFF3E0' : '#fff',
              }}
            >
              <span>Status</span>
              <span style={{
                color: purchase.status === 'paid' ? '#2E7D32' : purchase.status === 'partial' ? '#FF6F00' : '#1976D2',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {purchase.status || 'Saved'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                marginTop: '12px',
              }}
            >
              <div
                style={{
                  border: '1px solid #C8E6C9',
                  height: '80px',
                  padding: '10px',
                  color: '#2E7D32',
                  fontWeight: '600',
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span>Receive By</span>
                <div style={{ marginTop: 'auto', fontSize: '10px', color: '#8D6E63' }}>Authorized Signatory</div>
              </div>

              <div
                style={{
                  border: '1px solid #C8E6C9',
                  height: '80px',
                  padding: '10px',
                  color: '#2E7D32',
                  fontWeight: '600',
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span>Signature</span>
                <div style={{ marginTop: 'auto', fontSize: '10px', color: '#8D6E63' }}>Farmer Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Date Footer */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '12px',
            borderTop: '1px solid #C8E6C9',
            textAlign: 'center',
            fontSize: '9px',
            color: '#8D6E63',
          }}
        >
          <div>Purchase Date: {formatDate(purchase.purchaseDate)}</div>
          <div style={{ marginTop: '4px' }}>Generated on {formatDateTime(new Date())}</div>
          {purchase.notes && (
            <div style={{ marginTop: '8px', color: '#2E7D32', fontSize: '10px' }}>
              <strong>Note:</strong> {purchase.notes}
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .print-container {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 12mm 18mm 18mm 18mm !important;
              width: 100% !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PurchaseReceipt;