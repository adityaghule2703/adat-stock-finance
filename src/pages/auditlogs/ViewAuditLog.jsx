// // src/pages/audit/ViewAuditLog.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   ArrowBack as ArrowBackIcon,
//   Edit as MuiEditIcon,
//   Delete as MuiDeleteIcon,
//   Add as MuiAddIcon,
//   Settings as MuiSettingsIcon
// } from '@mui/icons-material';
// import {
//   History,
//   User,
//   Mail,
//   Shield,
//   Users,
//   Store,
//   Computer,
//   MapPin,
//   Calendar,
//   FileText,
//   CheckCircle,
//   ShoppingCart,
//   TrendingUp,
//   DollarSign,
//   Loader,
//   AlertCircle
// } from 'lucide-react';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';

// // Define custom icon components
// const EditIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );

// const TrashIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );

// const PlusIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//   </svg>
// );

// const SettingsIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//   </svg>
// );

// // Action configuration with icons and colors
// const actionConfig = {
//   'CREATE_PURCHASE': { icon: ShoppingCart, color: '#2E7D32', bg: '#E8F5E9', label: 'Create Purchase' },
//   'UPDATE_PURCHASE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update Purchase' },
//   'DELETE_PURCHASE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete Purchase' },
//   'CREATE_SALE': { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', label: 'Create Sale' },
//   'UPDATE_SALE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update Sale' },
//   'DELETE_SALE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete Sale' },
//   'CREATE_EXPENSE': { icon: DollarSign, color: '#F57C00', bg: '#FFF3E0', label: 'Create Expense' },
//   'UPDATE_EXPENSE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update Expense' },
//   'DELETE_EXPENSE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete Expense' },
//   'CREATE_PAYMENT': { icon: DollarSign, color: '#2E7D32', bg: '#E8F5E9', label: 'Create Payment' },
//   'UPDATE_PAYMENT': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update Payment' },
//   'DELETE_PAYMENT': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete Payment' },
//   'CREATE_FARMER': { icon: Users, color: '#2E7D32', bg: '#E8F5E9', label: 'Create Farmer' },
//   'UPDATE_FARMER': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update Farmer' },
//   'DELETE_FARMER': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete Farmer' },
//   'ADJUST_STOCK': { icon: EditIcon, color: '#7B1FA2', bg: '#F3E5F5', label: 'Adjust Stock' },
//   'TRANSFER_STOCK': { icon: EditIcon, color: '#1976D2', bg: '#E3F2FD', label: 'Transfer Stock' },
//   'SET_BUDGET': { icon: SettingsIcon, color: '#F57C00', bg: '#FFF3E0', label: 'Set Budget' },
//   'LOGIN': { icon: User, color: '#1976D2', bg: '#E3F2FD', label: 'Login' },
//   'LOGOUT': { icon: User, color: '#D32F2F', bg: '#FFEBEE', label: 'Logout' },
//   'CREATE': { icon: PlusIcon, color: '#2E7D32', bg: '#E8F5E9', label: 'Create' },
//   'UPDATE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', label: 'Update' },
//   'DELETE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', label: 'Delete' }
// };

// const ViewAuditLog = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [log, setLog] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getToken = () => localStorage.getItem('token');

//   const isAuthenticated = () => {
//     const token = getToken();
//     const isLoggedIn = localStorage.getItem('isLoggedIn');
//     if (!token || isLoggedIn !== 'true') {
//       navigate('/login');
//       return false;
//     }
//     return true;
//   };

//   const fetchAuditLog = async () => {
//     if (!isAuthenticated()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getToken();
//       const response = await axios.get(`${BASE_URL}/audit/${id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       if (response.data.success) {
//         setLog(response.data.data);
//       } else {
//         setError(response.data.message || 'Failed to fetch audit log details');
//       }
//     } catch (error) {
//       console.error('Error fetching audit log:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAuditLog();
//   }, [id]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   const formatTimeAgo = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//     return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//   };

//   const getRoleDetails = (role) => {
//     switch(role) {
//       case 'superadmin':
//         return { icon: Shield, color: '#2E7D32', bg: '#E8F5E9', label: 'Super Admin' };
//       case 'operator':
//         return { icon: Users, color: '#1976D2', bg: '#E3F2FD', label: 'Operator' };
//       case 'vendor':
//         return { icon: Store, color: '#FF6F00', bg: '#FFF3E0', label: 'Vendor' };
//       default:
//         return { icon: User, color: '#8D6E63', bg: '#FAFAFA', label: role };
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
//           <p style={{ color: '#8D6E63' }}>Loading audit log details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
//           <p className="text-red-600 mb-2">{error}</p>
//           <button 
//             onClick={fetchAuditLog}
//             className="px-4 py-2 rounded-lg text-white"
//             style={{ background: '#2E7D32' }}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!log) return null;

//   const action = actionConfig[log.action] || { icon: History, color: '#8D6E63', bg: '#FAFAFA', label: log.action?.replace(/_/g, ' ') || log.action };
//   const ActionIcon = action.icon;
//   const roleDetails = log.userId ? getRoleDetails(log.userId.role) : null;
//   const RoleIcon = roleDetails?.icon || User;

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => navigate('/audit-logs')}
//           className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//         >
//           <ArrowBackIcon className="w-5 h-5" style={{ color: '#2E7D32' }} />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Audit Log Details</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Complete audit trail information</p>
//         </div>
//       </div>

//       {/* Header Card */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
//           <div className="flex flex-wrap justify-between items-start gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
//                 <History className="w-7 h-7" style={{ color: '#2E7D32' }} />
//               </div>
//               <div>
//                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2" style={{ 
//                   background: action.bg,
//                   color: action.color
//                 }}>
//                   <ActionIcon />
//                   {action.label}
//                 </span>
//                 <p className="text-white/90 text-sm">
//                   {log.entityType && `Entity: ${log.entityType}`}
                 
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-white font-semibold">{formatDate(log.createdAt)}</p>
//               <p className="text-white/80 text-sm">{formatTimeAgo(log.createdAt)}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* User Information */}
//         {log.userId && (
//           <div className="bg-white rounded-xl p-6 shadow-sm">
//             <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//               <User className="w-5 h-5" /> User Information
//             </h3>
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: roleDetails?.bg || '#E8F5E9', color: roleDetails?.color || '#2E7D32' }}>
//                 <span className="text-lg font-bold">{getInitials(log.userId.name)}</span>
//               </div>
//               <div className="flex-1">
//                 <h4 className="font-semibold" style={{ color: '#2E7D32' }}>{log.userId.name}</h4>
//                 <div className="flex items-center gap-1 mt-1">
//                   <Mail className="w-3 h-3" style={{ color: '#8D6E63' }} />
//                   <p className="text-sm" style={{ color: '#8D6E63' }}>{log.userId.email}</p>
//                 </div>
//                 {roleDetails && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2" style={{ 
//                     background: roleDetails.bg,
//                     color: roleDetails.color
//                   }}>
//                     <RoleIcon className="w-3 h-3" />
//                     {roleDetails.label}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Details */}
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//             <History className="w-5 h-5" /> Action Details
//           </h3>
//           <div className="space-y-3">
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Action Type</label>
//               <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: action.bg }}>
//                 <ActionIcon />
//                 <span className="text-sm font-medium" style={{ color: action.color }}>{action.label}</span>
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Entity Type</label>
//               <div className="px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                 <span className="text-sm" style={{ color: '#2E7D32' }}>{log.entityType || 'N/A'}</span>
//               </div>
//             </div>
           
//             {log.notes && (
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Notes</label>
//                 <div className="px-3 py-2 rounded-lg" style={{ background: '#FFF3E0' }}>
//                   <span className="text-sm" style={{ color: '#5D4037' }}>{log.notes}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Technical Details */}
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//             <Computer className="w-5 h-5" /> Technical Details
//           </h3>
//           <div className="space-y-3">
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>IP Address</label>
//               <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#E3F2FD' }}>
//                 <MapPin className="w-4 h-4" style={{ color: '#1976D2' }} />
//                 <span className="text-sm font-mono" style={{ color: '#1976D2' }}>{log.ipAddress || 'N/A'}</span>
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Device Information</label>
//               <div className="px-3 py-2 rounded-lg break-all" style={{ background: '#F1F8E9' }}>
//                 <span className="text-xs" style={{ color: '#8D6E63' }}>{log.deviceInfo || 'N/A'}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* System Information */}
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//             <Calendar className="w-5 h-5" /> System Information
//           </h3>
//           <div className="space-y-3">
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Created At</label>
//               <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                 <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                 <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(log.createdAt)}</span>
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Last Updated</label>
//               <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                 <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                 <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(log.updatedAt)}</span>
//               </div>
//             </div>
            
//           </div>
//         </div>
//       </div>

//       {/* Before Value */}
//       {log.beforeValue && Object.keys(log.beforeValue).length > 0 && (
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#FF6F00' }}>
//             <FileText className="w-5 h-5" /> Before Value
//           </h3>
//           <div className="p-4 rounded-lg overflow-auto max-h-80" style={{ background: '#FFF3E0' }}>
//             <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: '#5D4037' }}>
//               {JSON.stringify(log.beforeValue, null, 2)}
//             </pre>
//           </div>
//         </div>
//       )}

//       {/* After Value */}
//       {log.afterValue && Object.keys(log.afterValue).length > 0 && (
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//             <CheckCircle className="w-5 h-5" /> After Value
//           </h3>
//           <div className="p-4 rounded-lg overflow-auto max-h-80" style={{ background: '#E8F5E9' }}>
//             <div className="space-y-2">
//               {Object.entries(log.afterValue).map(([key, value]) => (
//                 <div key={key} className="text-sm">
//                   <span className="font-medium" style={{ color: '#2E7D32' }}>{key}:</span>
//                   <span className="ml-2" style={{ color: '#5D4037' }}>{String(value)}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewAuditLog;







// src/pages/audit/ViewAuditLog.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowBack as ArrowBackIcon,
  Edit as MuiEditIcon,
  Delete as MuiDeleteIcon,
  Add as MuiAddIcon,
  Settings as MuiSettingsIcon
} from '@mui/icons-material';
import {
  History,
  User,
  Mail,
  Shield,
  Users,
  Store,
  Computer,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Define custom icon components
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Action configuration with icons and colors
const actionConfig = {
  'CREATE_PURCHASE': { icon: ShoppingCart, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createPurchase' },
  'UPDATE_PURCHASE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updatePurchase' },
  'DELETE_PURCHASE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deletePurchase' },
  'CREATE_SALE': { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.createSale' },
  'UPDATE_SALE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateSale' },
  'DELETE_SALE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteSale' },
  'CREATE_EXPENSE': { icon: DollarSign, color: '#F57C00', bg: '#FFF3E0', labelKey: 'audit.actions.createExpense' },
  'UPDATE_EXPENSE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateExpense' },
  'DELETE_EXPENSE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteExpense' },
  'CREATE_PAYMENT': { icon: DollarSign, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createPayment' },
  'UPDATE_PAYMENT': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updatePayment' },
  'DELETE_PAYMENT': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deletePayment' },
  'CREATE_FARMER': { icon: Users, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.createFarmer' },
  'UPDATE_FARMER': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.updateFarmer' },
  'DELETE_FARMER': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.deleteFarmer' },
  'ADJUST_STOCK': { icon: EditIcon, color: '#7B1FA2', bg: '#F3E5F5', labelKey: 'audit.actions.adjustStock' },
  'TRANSFER_STOCK': { icon: EditIcon, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.transferStock' },
  'SET_BUDGET': { icon: SettingsIcon, color: '#F57C00', bg: '#FFF3E0', labelKey: 'audit.actions.setBudget' },
  'LOGIN': { icon: User, color: '#1976D2', bg: '#E3F2FD', labelKey: 'audit.actions.login' },
  'LOGOUT': { icon: User, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.logout' },
  'CREATE': { icon: PlusIcon, color: '#2E7D32', bg: '#E8F5E9', labelKey: 'audit.actions.create' },
  'UPDATE': { icon: EditIcon, color: '#FF6F00', bg: '#FFF3E0', labelKey: 'audit.actions.update' },
  'DELETE': { icon: TrashIcon, color: '#D32F2F', bg: '#FFEBEE', labelKey: 'audit.actions.delete' }
};

const ViewAuditLog = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchAuditLog = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/audit/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        setLog(response.data.data);
      } else {
        setError(response.data.message || t('audit.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('audit.timeAgo.justNow');
    if (diffMins < 60) return t('audit.timeAgo.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('audit.timeAgo.hoursAgo', { count: diffHours });
    return t('audit.timeAgo.daysAgo', { count: diffDays });
  };

  const getRoleDetails = (role) => {
    switch(role) {
      case 'superadmin':
        return { icon: Shield, color: '#2E7D32', bg: '#E8F5E9', label: t('users.roles.superadmin') };
      case 'operator':
        return { icon: Users, color: '#1976D2', bg: '#E3F2FD', label: t('users.roles.operator') };
      case 'vendor':
        return { icon: Store, color: '#FF6F00', bg: '#FFF3E0', label: t('users.roles.vendor') };
      default:
        return { icon: User, color: '#8D6E63', bg: '#FAFAFA', label: role };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActionLabel = (actionKey) => {
    const config = actionConfig[actionKey];
    if (config && config.labelKey) {
      return t(config.labelKey);
    }
    return actionKey?.replace(/_/g, ' ') || actionKey;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
          <p style={{ color: '#8D6E63' }}>{t('audit.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchAuditLog}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: '#2E7D32' }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!log) return null;

  const action = actionConfig[log.action] || { icon: History, color: '#8D6E63', bg: '#FAFAFA', labelKey: null };
  const ActionIcon = action.icon;
  const roleDetails = log.userId ? getRoleDetails(log.userId.role) : null;
  const RoleIcon = roleDetails?.icon || User;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/audit-logs')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowBackIcon className="w-5 h-5" style={{ color: '#2E7D32' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('audit.modal.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('audit.subtitle')}</p>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <History className="w-7 h-7" style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2" style={{ 
                  background: action.bg,
                  color: action.color
                }}>
                  <ActionIcon />
                  {getActionLabel(log.action)}
                </span>
                <p className="text-white/90 text-sm">
                  {log.entityType && `${t('audit.table.entity')}: ${log.entityType}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{formatDate(log.createdAt)}</p>
              <p className="text-white/80 text-sm">{formatTimeAgo(log.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        {log.userId && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <User className="w-5 h-5" /> {t('audit.modal.userInfo')}
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: roleDetails?.bg || '#E8F5E9', color: roleDetails?.color || '#2E7D32' }}>
                <span className="text-lg font-bold">{getInitials(log.userId.name)}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold" style={{ color: '#2E7D32' }}>{log.userId.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" style={{ color: '#8D6E63' }} />
                  <p className="text-sm" style={{ color: '#8D6E63' }}>{log.userId.email}</p>
                </div>
                {roleDetails && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2" style={{ 
                    background: roleDetails.bg,
                    color: roleDetails.color
                  }}>
                    <RoleIcon className="w-3 h-3" />
                    {roleDetails.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
            <History className="w-5 h-5" /> {t('audit.modal.actionDetails')}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.action')}</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: action.bg }}>
                <ActionIcon />
                <span className="text-sm font-medium" style={{ color: action.color }}>{getActionLabel(log.action)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.entityType')}</label>
              <div className="px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                <span className="text-sm" style={{ color: '#2E7D32' }}>{log.entityType || 'N/A'}</span>
              </div>
            </div>
            {log.entityId && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.entityId')}</label>
                <div className="px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <span className="text-sm font-mono" style={{ color: '#2E7D32' }}>{log.entityId}</span>
                </div>
              </div>
            )}
            {log.notes && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.notes')}</label>
                <div className="px-3 py-2 rounded-lg" style={{ background: '#FFF3E0' }}>
                  <span className="text-sm" style={{ color: '#5D4037' }}>{log.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
            <Computer className="w-5 h-5" /> {t('audit.modal.technicalDetails')}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.ipAddress')}</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#E3F2FD' }}>
                <MapPin className="w-4 h-4" style={{ color: '#1976D2' }} />
                <span className="text-sm font-mono" style={{ color: '#1976D2' }}>{log.ipAddress || 'N/A'}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.deviceInfo')}</label>
              <div className="px-3 py-2 rounded-lg break-all" style={{ background: '#F1F8E9' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{log.deviceInfo || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
            <Calendar className="w-5 h-5" /> {t('audit.modal.systemInfo')}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.createdAt')}</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(log.createdAt)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('audit.modal.updatedAt')}</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(log.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Before Value */}
      {log.beforeValue && Object.keys(log.beforeValue).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#FF6F00' }}>
            <FileText className="w-5 h-5" /> {t('audit.modal.beforeValue')}
          </h3>
          <div className="p-4 rounded-lg overflow-auto max-h-80" style={{ background: '#FFF3E0' }}>
            <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: '#5D4037' }}>
              {JSON.stringify(log.beforeValue, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* After Value */}
      {log.afterValue && Object.keys(log.afterValue).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
            <CheckCircle className="w-5 h-5" /> {t('audit.modal.afterValue')}
          </h3>
          <div className="p-4 rounded-lg overflow-auto max-h-80" style={{ background: '#E8F5E9' }}>
            <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: '#5D4037' }}>
              {JSON.stringify(log.afterValue, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAuditLog;