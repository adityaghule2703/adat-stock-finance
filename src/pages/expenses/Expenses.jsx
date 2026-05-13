// // src/pages/expenses/Expenses.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Wallet, Search, Filter, Eye, Edit2,
//   Plus, Download, Loader, AlertCircle,
//   Calendar, DollarSign, X,
//   CheckCircle, XCircle, Clock, FileText, 
//   Truck, Briefcase, Landmark, Warehouse, 
//   Building, Wrench, Banknote, Megaphone,
//   MoreVertical, PowerOff, Trash2
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const Expenses = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     pages: 1
//   });
//   const [stats, setStats] = useState({
//     totalExpenses: 0,
//     totalAmount: 0,
//     createdAmount: 0,
//     cancelledAmount: 0
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     startDate: '',
//     endDate: '',
//     category: 'all',
//     status: 'all'
//   });
  
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedExpenseForMenu, setSelectedExpenseForMenu] = useState(null);
  
//   // Modal states
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');
//   const [modalError, setModalError] = useState(null);

//   // Category options as per backend enum
//   const categoryOptions = [
//     { value: 'transport_logistics', label: 'Transport & Logistics', icon: Truck },
//     { value: 'labour_wages', label: 'Labour & Wages', icon: Briefcase },
//     { value: 'market_fees', label: 'Market Fees', icon: Landmark },
//     { value: 'storage_cold_chain', label: 'Storage & Cold Chain', icon: Warehouse },
//     { value: 'shop_office', label: 'Shop & Office', icon: Building },
//     { value: 'repairs_maintenance', label: 'Repairs & Maintenance', icon: Wrench },
//     { value: 'banking_finance', label: 'Banking & Finance', icon: Banknote },
//     { value: 'marketing_misc', label: 'Marketing & Miscellaneous', icon: Megaphone }
//   ];

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setPagination(prev => ({ ...prev, page: 1 }));
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

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

//   const fetchExpenses = useCallback(async () => {
//     if (!isAuthenticated()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getToken();
//       const queryParams = new URLSearchParams({
//         page: pagination.page,
//         limit: pagination.limit
//       });
      
//       if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
//       if (filters.startDate) queryParams.append('startDate', filters.startDate);
//       if (filters.endDate) queryParams.append('endDate', filters.endDate);
//       if (filters.category !== 'all') queryParams.append('category', filters.category);
//       if (filters.status !== 'all') queryParams.append('status', filters.status);
      
//       const response = await fetch(`${BASE_URL}/expenses?${queryParams}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();

//       if (data.success) {
//         setExpenses(data.data);
//         setPagination(data.pagination);
        
//         const totalAmount = data.data.reduce((sum, exp) => sum + (exp.amount || 0), 0);
//         const createdAmount = data.data.filter(e => e.status === 'created').reduce((sum, e) => sum + (e.amount || 0), 0);
//         const cancelledAmount = data.data.filter(e => e.status === 'cancelled').reduce((sum, e) => sum + (e.amount || 0), 0);
        
//         setStats({
//           totalExpenses: data.pagination.total || data.data.length,
//           totalAmount,
//           createdAmount,
//           cancelledAmount
//         });
//       } else {
//         setError(data.message || 'Failed to fetch expenses');
//       }
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.category, filters.status, navigate]);

//   // Cancel expense
//   const handleCancelExpense = async () => {
//     if (!cancelReason.trim()) {
//       setModalError('Please provide a reason for cancellation');
//       return;
//     }
    
//     setCancelling(true);
//     setModalError(null);
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/expenses/${selectedExpenseForMenu._id}/cancel`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ reason: cancelReason })
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setShowCancelModal(false);
//         setSelectedExpenseForMenu(null);
//         setCancelReason('');
//         fetchExpenses();
//       } else {
//         setModalError(data.message || data.error || 'Failed to cancel expense');
//       }
//     } catch (error) {
//       console.error('Error cancelling expense:', error);
//       setModalError('Network error. Please try again.');
//     } finally {
//       setCancelling(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setFilters({ startDate: '', endDate: '', category: 'all', status: 'all' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//   };

//   const applyFilters = () => {
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//     fetchExpenses();
//   };

//   useEffect(() => {
//     fetchExpenses();
//   }, [fetchExpenses]);

//   const handleActionMenuOpen = (event, expense) => {
//     event.stopPropagation();
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedExpenseForMenu(expense);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedExpenseForMenu(null);
//   };

//   const openCancelModal = (expense) => {
//     setSelectedExpenseForMenu(expense);
//     setModalError(null);
//     setCancelReason('');
//     setShowCancelModal(true);
//     setActionMenuAnchor(null);
//   };

//   const closeModals = () => {
//     setShowCancelModal(false);
//     setSelectedExpenseForMenu(null);
//     setModalError(null);
//     setCancelReason('');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency', currency: 'INR', minimumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getCategoryLabel = (category) => {
//     const found = categoryOptions.find(c => c.value === category);
//     return found?.label || category?.replace(/_/g, ' ') || 'Other';
//   };

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'created':
//         return { bg: '#E3F2FD', text: '#1976D2', label: 'Created', icon: FileText };
//       case 'cancelled':
//         return { bg: '#FFEBEE', text: '#D32F2F', label: 'Cancelled', icon: XCircle };
//       default:
//         return { bg: '#E3F2FD', text: '#1976D2', label: status || 'Unknown', icon: AlertCircle };
//     }
//   };

//   // Smart dropdown positioning
//   const MENU_HEIGHT = 200;
//   const anchorRect = actionMenuAnchor?.getBoundingClientRect();
//   const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
//   const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

//   if (loading && expenses.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading expenses...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Expenses</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Track and manage all business expenses</p>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Expenses</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalExpenses}</p>
//             </div>
//             <Wallet className="w-8 h-8" style={{ color: '#43A047' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Amount</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalAmount)}</p>
//             </div>
//             <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Created</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.createdAmount)}</p>
//             </div>
//             <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Cancelled</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#D32F2F' }}>{formatCurrency(stats.cancelledAmount)}</p>
//             </div>
//             <XCircle className="w-8 h-8" style={{ color: '#D32F2F' }} />
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchExpenses} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4 items-center justify-between">
//           <div className="w-80">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//               <input
//                 type="text"
//                 placeholder="Search by description, paid to, or reference..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
//                 style={{ borderColor: '#C8E6C9' }}
//               />
//               {searchTerm && (
//                 <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                   <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                 </button>
//               )}
//             </div>
//           </div>
          
//           <div className="flex gap-3">
//             <button 
//               onClick={() => setShowFilters(!showFilters)}
//               className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}
//               style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {(filters.startDate || filters.endDate || filters.category !== 'all' || filters.status !== 'all') && (
//                 <span className="w-2 h-2 rounded-full bg-orange-500"></span>
//               )}
//             </button>
//             <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//             <button 
//               onClick={() => navigate('/expenses/add')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//               style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//             >
//               <Plus className="w-4 h-4" />
//               Add Expense
//             </button>
//           </div>
//         </div>

//         {/* Filter Panel */}
//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Start Date</label>
//                 <input 
//                   type="date" 
//                   value={filters.startDate} 
//                   onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
//                   className="w-full px-3 py-2 border rounded-lg text-sm" 
//                   style={{ borderColor: '#C8E6C9' }} 
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>End Date</label>
//                 <input 
//                   type="date" 
//                   value={filters.endDate} 
//                   onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
//                   className="w-full px-3 py-2 border rounded-lg text-sm" 
//                   style={{ borderColor: '#C8E6C9' }} 
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Category</label>
//                 <select 
//                   value={filters.category} 
//                   onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
//                   className="w-full px-3 py-2 border rounded-lg text-sm" 
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="all">All Categories</option>
//                   {categoryOptions.map(opt => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Status</label>
//                 <select 
//                   value={filters.status} 
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })} 
//                   className="w-full px-3 py-2 border rounded-lg text-sm" 
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="all">All Status</option>
//                   <option value="created">Created</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button 
//                 onClick={clearFilters} 
//                 className="px-3 py-1 border rounded-lg text-sm"
//                 style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//               >
//                 Clear All
//               </button>
//               <button 
//                 onClick={() => setShowFilters(false)} 
//                 className="px-3 py-1 border rounded-lg text-sm"
//                 style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={applyFilters} 
//                 className="px-3 py-1 rounded-lg text-white text-sm"
//                 style={{ background: '#2E7D32' }}
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Expenses Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
//             <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
//           </div>
//         ) : expenses.length === 0 ? (
//           <div className="text-center py-12">
//             <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//             <p className="text-sm" style={{ color: '#8D6E63' }}>No expenses found</p>
//             {(searchTerm || filters.startDate || filters.endDate || filters.category !== 'all' || filters.status !== 'all') && (
//               <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
//                 Clear filters
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Category</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Description</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Amount</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Paid By</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                     <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {expenses.map((expense, index) => {
//                     const status = getStatusBadge(expense.status);
//                     const StatusIcon = status.icon;
//                     const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedExpenseForMenu?._id === expense._id;
                    
//                     return (
//                       <tr 
//                         key={expense._id} 
//                         className="hover:bg-green-50 transition-colors"
//                         style={{ 
//                           borderBottom: index !== expenses.length - 1 ? '1px solid #E8F5E9' : 'none'
//                         }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                             <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(expense.expenseDate)}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm" style={{ color: '#5D4037' }}>{getCategoryLabel(expense.category)}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="text-sm" style={{ color: '#5D4037' }}>{expense.description}</p>
//                             {expense.paidTo && (
//                               <p className="text-xs" style={{ color: '#8D6E63' }}>To: {expense.paidTo}</p>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>
//                             {formatCurrency(expense.amount)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <span className="text-sm capitalize" style={{ color: '#5D4037' }}>{expense.paidBy}</span>
//                             {expense.referenceNumber && (
//                               <p className="text-xs" style={{ color: '#8D6E63' }}>Ref: {expense.referenceNumber}</p>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
//                             background: status.bg,
//                             color: status.text
//                           }}>
//                             <StatusIcon className="w-3 h-3" />
//                             {status.label}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={(e) => handleActionMenuOpen(e, expense)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
//                             style={{ color: '#2E7D32' }}
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                             <span className="text-xs font-medium">Actions</span>
//                           </button>

//                           {isActionMenuOpen && anchorRect && (
//                             <div
//                               className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                               style={{
//                                 borderColor: '#E8F5E9',
//                                 width: '180px',
//                                 position: 'fixed',
//                                 top: openUpward
//                                   ? anchorRect.top - MENU_HEIGHT - 4
//                                   : anchorRect.bottom + 4,
//                                 left: anchorRect.left - 120,
//                               }}
//                             >
//                               <button
//                                 onClick={() => {
//                                   navigate(`/expenses/view/${expense._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#2E7D32' }}
//                               >
//                                 <Eye className="w-4 h-4" />
//                                 View Details
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   navigate(`/expenses/edit/${expense._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#FF6F00' }}
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 Edit
//                               </button>

//                               {expense.status === 'created' && (
//                                 <button
//                                   onClick={() => openCancelModal(expense)}
//                                   className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
//                                   style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
//                                 >
//                                   <XCircle className="w-4 h-4" />
//                                   Cancel Expense
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
            
//             {/* Server-side Pagination */}
//             {pagination.pages > 1 && (
//               <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-xs" style={{ color: '#8D6E63' }}>
//                   Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                   {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
//                     disabled={pagination.page === 1}
//                     className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//                   >
//                     Previous
//                   </button>
//                   <div className="flex gap-1">
//                     {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
//                       let pageNum;
//                       if (pagination.pages <= 5) {
//                         pageNum = i + 1;
//                       } else if (pagination.page <= 3) {
//                         pageNum = i + 1;
//                       } else if (pagination.page >= pagination.pages - 2) {
//                         pageNum = pagination.pages - 4 + i;
//                       } else {
//                         pageNum = pagination.page - 2 + i;
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setPagination({ ...pagination, page: pageNum })}
//                           className="w-8 h-8 rounded border text-sm transition-all"
//                           style={{
//                             borderColor: '#C8E6C9',
//                             background: pagination.page === pageNum ? '#2E7D32' : 'white',
//                             color: pagination.page === pageNum ? 'white' : '#2E7D32'
//                           }}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>
//                   <button
//                     onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
//                     disabled={pagination.page === pagination.pages}
//                     className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Global Backdrop for Action Menu */}
//       {Boolean(actionMenuAnchor) && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={handleActionMenuClose}
//           style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
//         />
//       )}

//       {/* Cancel Confirmation Modal */}
//       {showCancelModal && selectedExpenseForMenu && (
//         <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
//           <div
//             className="absolute inset-0"
//             style={{
//               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//               backgroundColor: 'rgba(0, 0, 0, 0.6)',
//               backdropFilter: 'blur(4px)'
//             }}
//             onClick={() => closeModals()}
//           />
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
//               <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
//                 <div>
//                   <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>Cancel Expense</h3>
//                   <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Confirm cancellation</p>
//                 </div>
//                 <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                   <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
//                     <XCircle className="w-8 h-8" style={{ color: '#D32F2F' }} />
//                   </div>
//                 </div>
                
//                 {modalError && (
//                   <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
//                     <div className="flex items-start gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//                       <p className="text-sm text-red-600">{modalError}</p>
//                     </div>
//                   </div>
//                 )}
                
//                 <p className="text-center text-sm mb-4" style={{ color: '#5D4037' }}>
//                   Are you sure you want to cancel expense of <strong>{formatCurrency(selectedExpenseForMenu.amount)}</strong> for <strong>{selectedExpenseForMenu.description}</strong>?
//                 </p>
                
//                 <div className="mb-4">
//                   <label className="block text-xs font-medium mb-2" style={{ color: '#2E7D32' }}>
//                     Reason for cancellation <span className="text-red-500">*</span>
//                   </label>
//                   <textarea
//                     value={cancelReason}
//                     onChange={(e) => setCancelReason(e.target.value)}
//                     rows="3"
//                     className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1"
//                     style={{ borderColor: '#C8E6C9' }}
//                     placeholder="Enter reason for cancelling this expense..."
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <button
//                   onClick={() => closeModals()}
//                   className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
//                   style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCancelExpense}
//                   disabled={cancelling}
//                   className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
//                   style={{ background: '#D32F2F' }}
//                 >
//                   {cancelling ? (
//                     <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
//                   ) : (
//                     <><XCircle className="w-4 h-4" /> Confirm Cancellation</>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Expenses;



// src/pages/expenses/Expenses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, Search, Filter, Eye, Edit2,
  Plus, Download, Loader, AlertCircle,
  Calendar, DollarSign, X,
  CheckCircle, XCircle, Clock, FileText, 
  Truck, Briefcase, Landmark, Warehouse, 
  Building, Wrench, Banknote, Megaphone,
  MoreVertical, PowerOff, Trash2
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Expenses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    createdAmount: 0,
    cancelledAmount: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedExpenseForMenu, setSelectedExpenseForMenu] = useState(null);
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [modalError, setModalError] = useState(null);

  // Category options as per backend enum with i18n labels
  const categoryOptions = [
    { value: 'transport_logistics', labelKey: 'expenses.categories.transport', icon: Truck },
    { value: 'labour_wages', labelKey: 'expenses.categories.labour', icon: Briefcase },
    { value: 'market_fees', labelKey: 'expenses.categories.marketFees', icon: Landmark },
    { value: 'storage_cold_chain', labelKey: 'expenses.categories.storage', icon: Warehouse },
    { value: 'shop_office', labelKey: 'expenses.categories.shopOffice', icon: Building },
    { value: 'repairs_maintenance', labelKey: 'expenses.categories.repairs', icon: Wrench },
    { value: 'banking_finance', labelKey: 'expenses.categories.banking', icon: Banknote },
    { value: 'marketing_misc', labelKey: 'expenses.categories.marketing', icon: Megaphone }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      
      const response = await fetch(`${BASE_URL}/expenses?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setExpenses(data.data);
        setPagination(data.pagination);
        
        const totalAmount = data.data.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const createdAmount = data.data.filter(e => e.status === 'created').reduce((sum, e) => sum + (e.amount || 0), 0);
        const cancelledAmount = data.data.filter(e => e.status === 'cancelled').reduce((sum, e) => sum + (e.amount || 0), 0);
        
        setStats({
          totalExpenses: data.pagination.total || data.data.length,
          totalAmount,
          createdAmount,
          cancelledAmount
        });
      } else {
        setError(data.message || t('expenses.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.category, filters.status, navigate, t]);

  // Cancel expense
  const handleCancelExpense = async () => {
    if (!cancelReason.trim()) {
      setModalError(t('expenses.errors.reasonRequired'));
      return;
    }
    
    setCancelling(true);
    setModalError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${selectedExpenseForMenu._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setShowCancelModal(false);
        setSelectedExpenseForMenu(null);
        setCancelReason('');
        fetchExpenses();
      } else {
        setModalError(data.message || data.error || t('expenses.errors.cancelFailed'));
      }
    } catch (error) {
      console.error('Error cancelling expense:', error);
      setModalError(t('common.networkError'));
    } finally {
      setCancelling(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', category: 'all', status: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleActionMenuOpen = (event, expense) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedExpenseForMenu(expense);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedExpenseForMenu(null);
  };

  const openCancelModal = (expense) => {
    setSelectedExpenseForMenu(expense);
    setModalError(null);
    setCancelReason('');
    setShowCancelModal(true);
    setActionMenuAnchor(null);
  };

  const closeModals = () => {
    setShowCancelModal(false);
    setSelectedExpenseForMenu(null);
    setModalError(null);
    setCancelReason('');
  };

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
    return found ? t(found.labelKey) : category?.replace(/_/g, ' ') || 'Other';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'created':
        return { bg: '#E3F2FD', text: '#1976D2', label: t('expenses.status.created'), icon: FileText };
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#D32F2F', label: t('expenses.status.cancelled'), icon: XCircle };
      default:
        return { bg: '#E3F2FD', text: '#1976D2', label: status || t('expenses.status.unknown'), icon: AlertCircle };
    }
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 200;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('expenses.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('expenses.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('expenses.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.stats.totalExpenses')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalExpenses}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.stats.totalAmount')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.stats.created')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.createdAmount)}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.stats.cancelled')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#D32F2F' }}>{formatCurrency(stats.cancelledAmount)}</p>
            </div>
            <XCircle className="w-8 h-8" style={{ color: '#D32F2F' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchExpenses} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('expenses.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
              {(filters.startDate || filters.endDate || filters.category !== 'all' || filters.status !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            {/* <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button> */}
            <button 
              onClick={() => navigate('/expenses/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" />
              {t('expenses.buttons.addExpense')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('expenses.filters.startDate')}</label>
                <input 
                  type="date" 
                  value={filters.startDate} 
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  style={{ borderColor: '#C8E6C9' }} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('expenses.filters.endDate')}</label>
                <input 
                  type="date" 
                  value={filters.endDate} 
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  style={{ borderColor: '#C8E6C9' }} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('expenses.filters.category')}</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allCategories')}</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('expenses.filters.status')}</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allStatus')}</option>
                  <option value="created">{t('expenses.status.created')}</option>
                  <option value="cancelled">{t('expenses.status.cancelled')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={clearFilters} 
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.clearAll')}
              </button>
              <button 
                onClick={() => setShowFilters(false)} 
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={applyFilters} 
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('expenses.noExpensesFound')}</p>
            {(searchTerm || filters.startDate || filters.endDate || filters.category !== 'all' || filters.status !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.category')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.description')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.paidBy')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.status')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('expenses.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => {
                    const status = getStatusBadge(expense.status);
                    const StatusIcon = status.icon;
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedExpenseForMenu?._id === expense._id;
                    
                    return (
                      <tr 
                        key={expense._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== expenses.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(expense.expenseDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#5D4037' }}>{getCategoryLabel(expense.category)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm" style={{ color: '#5D4037' }}>{expense.description}</p>
                            {expense.paidTo && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.to')}: {expense.paidTo}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-sm capitalize" style={{ color: '#5D4037' }}>{expense.paidBy}</span>
                            {expense.referenceNumber && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('expenses.ref')}: {expense.referenceNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: status.bg,
                            color: status.text
                          }}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, expense)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '180px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 120,
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/expenses/view/${expense._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/expenses/edit/${expense._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('common.edit')}
                              </button>

                              {expense.status === 'created' && (
                                <button
                                  onClick={() => openCancelModal(expense)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                                  style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
                                >
                                  <XCircle className="w-4 h-4" />
                                  {t('expenses.buttons.cancelExpense')}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Server-side Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('expenses.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.previous')}
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className="w-8 h-8 rounded border text-sm transition-all"
                          style={{
                            borderColor: '#C8E6C9',
                            background: pagination.page === pageNum ? '#2E7D32' : 'white',
                            color: pagination.page === pageNum ? 'white' : '#2E7D32'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleActionMenuClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedExpenseForMenu && (
        <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => closeModals()}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>{t('expenses.modals.cancel.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('expenses.modals.cancel.subtitle')}</p>
                </div>
                <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-8 h-8" style={{ color: '#D32F2F' }} />
                  </div>
                </div>
                
                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-center text-sm mb-4" style={{ color: '#5D4037' }}>
                  {t('expenses.modals.cancel.confirmMessage', {
                    amount: formatCurrency(selectedExpenseForMenu.amount),
                    description: selectedExpenseForMenu.description
                  })}
                </p>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-2" style={{ color: '#2E7D32' }}>
                    {t('expenses.modals.cancel.reasonLabel')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{ borderColor: '#C8E6C9' }}
                    placeholder={t('expenses.modals.cancel.reasonPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => closeModals()}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCancelExpense}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: '#D32F2F' }}
                >
                  {cancelling ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.processing')}...</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> {t('expenses.buttons.confirmCancellation')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;