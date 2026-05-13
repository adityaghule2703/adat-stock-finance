// // src/pages/inventory/ViewWarehouse.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Edit2, Warehouse, Building, MapPin, User, Phone, Mail, Package, TrendingUp, CheckCircle, XCircle, Loader, AlertCircle, FileText } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const ViewWarehouse = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [warehouse, setWarehouse] = useState(null);
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getToken = () => localStorage.getItem('token');

//   const fetchWarehouseDetails = async () => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setWarehouse(data.data.warehouse);
//         setInventory(data.data.inventory || []);
//       } else {
//         setError(data.message || 'Failed to fetch warehouse details');
//       }
//     } catch (error) {
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchWarehouseDetails(); }, [id]);

//   const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);
//   const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading warehouse details...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//         <p className="text-red-600">{error}</p>
//         <button onClick={() => navigate('/warehouses')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105" style={{ background: '#2E7D32' }}>
//           Back to Warehouses
//         </button>
//       </div>
//     );
//   }

//   const capacityPercent = warehouse?.capacity?.total ? ((warehouse.capacity.used || 0) / warehouse.capacity.total) * 100 : 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate('/warehouses')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
//             <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{warehouse?.name}</h1>
//             <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Code: {warehouse?.code}</p>
//           </div>
//         </div>
//         <button 
//           onClick={() => navigate(`/warehouses/edit/${id}`)} 
//           className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//           style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
//           <Edit2 className="w-4 h-4" /> Edit Warehouse
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {/* Warehouse Information */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//               <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Warehouse Information</h2>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Warehouse Name</p>
//                   <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{warehouse?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Warehouse Code</p>
//                   <p className="text-base font-mono font-semibold" style={{ color: '#5D4037' }}>{warehouse?.code}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Status</p>
//                   <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
//                     warehouse?.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
//                   }`}>
//                     {warehouse?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
//                     {warehouse?.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Created By</p>
//                   <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse?.createdBy?.name}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Location */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//               <div className="flex items-center gap-2">
//                 <MapPin className="w-4 h-4" style={{ color: '#FFFFFF' }} />
//                 <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Location</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse?.location?.address}</p>
//               <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{warehouse?.location?.city}, {warehouse?.location?.state} - {warehouse?.location?.pincode}</p>
//             </div>
//           </div>

//           {/* Manager Details */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//               <div className="flex items-center gap-2">
//                 <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
//                 <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Manager Details</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Manager Name</p>
//                   <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{warehouse?.manager?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Phone</p>
//                   <p className="text-sm flex items-center gap-1" style={{ color: '#5D4037' }}>
//                     <Phone className="w-3 h-3 text-gray-400" />
//                     {warehouse?.manager?.phone}
//                   </p>
//                 </div>
//                 <div className="col-span-2">
//                   <p className="text-xs text-gray-500 mb-1">Email</p>
//                   <p className="text-sm flex items-center gap-1" style={{ color: '#5D4037' }}>
//                     <Mail className="w-3 h-3 text-gray-400" />
//                     {warehouse?.manager?.email || 'Not provided'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {/* Capacity Usage */}
//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
//             <h3 className="text-base font-bold mb-3 uppercase tracking-wider" style={{ color: '#1B5E20' }}>Capacity Usage</h3>
//             <div className="mb-2 flex justify-between text-sm">
//               <span style={{ color: '#5D4037' }}>Used: {formatNumber(warehouse?.capacity?.used)} {warehouse?.capacity?.unit}</span>
//               <span style={{ color: '#5D4037' }}>Total: {formatNumber(warehouse?.capacity?.total)} {warehouse?.capacity?.unit}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div className="rounded-full h-2.5" style={{ width: `${Math.min(capacityPercent, 100)}%`, background: '#2E7D32' }}></div>
//             </div>
//             <p className="text-xs mt-2" style={{ color: '#8D6E63' }}>{capacityPercent.toFixed(1)}% capacity utilized</p>
//           </div>

//           {/* Inventory Summary */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//               <div className="flex items-center gap-2">
//                 <Package className="w-4 h-4" style={{ color: '#FFFFFF' }} />
//                 <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Inventory Summary</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="text-center">
//                 <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>{warehouse?.stats?.productCount || 0}</p>
//                 <p className="text-sm" style={{ color: '#8D6E63' }}>Products Stored</p>
//               </div>
//               <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-center">
//                   <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatNumber(warehouse?.stats?.totalStockUnits || 0)}</p>
//                   <p className="text-sm" style={{ color: '#8D6E63' }}>Total Stock Units</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Notes */}
//       {warehouse?.notes && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//             <div className="flex items-center gap-2">
//               <FileText className="w-4 h-4" style={{ color: '#FFFFFF' }} />
//               <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Notes</h2>
//             </div>
//           </div>
//           <div className="p-6">
//             <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse.notes}</p>
//           </div>
//         </div>
//       )}

//       {/* Stock Details Table */}
//       {inventory.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//             <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Stock Details</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Product</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Current Stock</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Unit</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Last Updated</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {inventory.map((item, index) => (
//                   <tr 
//                     key={item._id} 
//                     className="hover:bg-green-50 transition-colors"
//                     style={{ borderBottom: index !== inventory.length - 1 ? '1px solid #E8F5E9' : 'none' }}
//                   >
//                     <td className="px-6 py-4">
//                       <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.productName}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{formatNumber(item.currentStock)}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="text-sm" style={{ color: '#5D4037' }}>{item.unit}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="text-xs" style={{ color: '#8D6E63' }}>{new Date(item.lastUpdated).toLocaleDateString()}</span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewWarehouse;




// src/pages/inventory/ViewWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Warehouse, Building, MapPin, User, Phone, Mail, Package, TrendingUp, CheckCircle, XCircle, Loader, AlertCircle, FileText } from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewWarehouse = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouseDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWarehouse(data.data.warehouse);
        setInventory(data.data.inventory || []);
      } else {
        setError(data.message || t('warehouses.errors.fetchFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouseDetails(); }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('warehouses.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/warehouses')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105" style={{ background: '#2E7D32' }}>
          {t('common.backToWarehouses')}
        </button>
      </div>
    );
  }

  const capacityPercent = warehouse?.capacity?.total ? ((warehouse.capacity.used || 0) / warehouse.capacity.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/warehouses')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{warehouse?.name}</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('warehouses.code')}: {warehouse?.code}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/warehouses/edit/${id}`)} 
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
          <Edit2 className="w-4 h-4" /> {t('common.edit')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.warehouseInformation')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('warehouses.name')}</p>
                  <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{warehouse?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('warehouses.code')}</p>
                  <p className="text-base font-mono font-semibold" style={{ color: '#5D4037' }}>{warehouse?.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('warehouses.status.label')}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    warehouse?.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                  }`}>
                    {warehouse?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {warehouse?.isActive ? t('warehouses.status.active') : t('warehouses.status.inactive')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('warehouses.createdBy')}</p>
                  <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse?.createdBy?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.location')}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse?.location?.address}</p>
              <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{warehouse?.location?.city}, {warehouse?.location?.state} - {warehouse?.location?.pincode}</p>
            </div>
          </div>

          {/* Manager Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.managerDetails')}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('warehouses.managerName')}</p>
                  <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{warehouse?.manager?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('farmers.mobileNumber')}</p>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#5D4037' }}>
                    <Phone className="w-3 h-3 text-gray-400" />
                    {warehouse?.manager?.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">{t('common.email')}</p>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#5D4037' }}>
                    <Mail className="w-3 h-3 text-gray-400" />
                    {warehouse?.manager?.email || t('common.notProvided')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Capacity Usage */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-base font-bold mb-3 uppercase tracking-wider" style={{ color: '#1B5E20' }}>{t('warehouses.capacityUsage')}</h3>
            <div className="mb-2 flex justify-between text-sm">
              <span style={{ color: '#5D4037' }}>{t('warehouses.used')}: {formatNumber(warehouse?.capacity?.used)} {warehouse?.capacity?.unit}</span>
              <span style={{ color: '#5D4037' }}>{t('warehouses.total')}: {formatNumber(warehouse?.capacity?.total)} {warehouse?.capacity?.unit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="rounded-full h-2.5" style={{ width: `${Math.min(capacityPercent, 100)}%`, background: '#2E7D32' }}></div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#8D6E63' }}>{capacityPercent.toFixed(1)}% {t('warehouses.capacityUtilized')}</p>
          </div>

          {/* Inventory Summary */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.inventorySummary')}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>{warehouse?.stats?.productCount || 0}</p>
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('warehouses.productsStored')}</p>
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatNumber(warehouse?.stats?.totalStockUnits || 0)}</p>
                  <p className="text-sm" style={{ color: '#8D6E63' }}>{t('warehouses.totalStockUnits')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {warehouse?.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('common.notes')}</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse.notes}</p>
          </div>
        </div>
      )}

      {/* Stock Details Table */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.stockDetails')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('inventory.table.product')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('inventory.table.currentStock')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('inventory.table.unit')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('inventory.table.lastUpdated')}</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr 
                    key={item._id} 
                    className="hover:bg-green-50 transition-colors"
                    style={{ borderBottom: index !== inventory.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.productName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{formatNumber(item.currentStock)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#5D4037' }}>{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: '#8D6E63' }}>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWarehouse;