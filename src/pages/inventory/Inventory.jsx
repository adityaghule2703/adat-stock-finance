// // src/pages/inventory/Inventory.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Package, Search, Filter, Eye, Edit2, 
//   Plus, Download, RefreshCw, Loader, AlertCircle,
//   TrendingUp, TrendingDown, Warehouse, XCircle,
//   CheckCircle, AlertTriangle, Building, ArrowLeftRight, X,
//   MoreVertical
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const Inventory = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     pages: 0
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [warehouseFilter, setWarehouseFilter] = useState('');
//   const [lowStockOnly, setLowStockOnly] = useState(false);
//   const [warehouses, setWarehouses] = useState([]);
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalStock: 0,
//     lowStockCount: 0,
//     warehouseCount: 0
//   });
  
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedItemForMenu, setSelectedItemForMenu] = useState(null);

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

//   // Fetch inventory items with pagination
//   const fetchInventory = useCallback(async () => {
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
//       if (warehouseFilter) queryParams.append('warehouse', warehouseFilter);
//       if (lowStockOnly) queryParams.append('lowStock', 'true');
      
//       const response = await fetch(`${BASE_URL}/inventory?${queryParams}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Check if response has pagination or if it's just an array
//         let items = [];
//         let paginationData = null;
        
//         if (data.data && Array.isArray(data.data)) {
//           items = data.data;
//           paginationData = data.pagination;
//         } else if (data.data && data.data.items) {
//           items = data.data.items;
//           paginationData = data.data.pagination;
//         } else if (Array.isArray(data)) {
//           items = data;
//         } else if (data.items) {
//           items = data.items;
//           paginationData = data.pagination;
//         }
        
//         setInventory(items);
        
//         // Set pagination if available
//         if (paginationData) {
//           setPagination({
//             page: paginationData.page || 1,
//             limit: paginationData.limit || 5,
//             total: paginationData.total || items.length,
//             pages: paginationData.pages || Math.ceil((paginationData.total || items.length) / (paginationData.limit || 5))
//           });
//         } else {
//           // If no pagination from API, create client-side pagination info
//           setPagination({
//             ...pagination,
//             total: items.length,
//             pages: Math.ceil(items.length / pagination.limit)
//           });
//         }
        
//         // Extract unique warehouses
//         const uniqueWarehouses = [...new Set(items.map(item => item.warehouse).filter(Boolean))];
//         setWarehouses(uniqueWarehouses);
        
//         // Calculate stats
//         const totalStock = items.reduce((sum, item) => sum + (item.currentStock || item.stock || 0), 0);
//         const lowStockCount = items.filter(item => (item.currentStock || item.stock || 0) <= 10).length;
        
//         setStats({
//           totalProducts: paginationData?.total || items.length,
//           totalStock,
//           lowStockCount,
//           warehouseCount: uniqueWarehouses.length
//         });
//       } else {
//         setError(data.message || 'Failed to fetch inventory');
//       }
//     } catch (error) {
//       console.error('Error fetching inventory:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, debouncedSearchTerm, warehouseFilter, lowStockOnly, navigate]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchInventory();
//     setRefreshing(false);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setWarehouseFilter('');
//     setLowStockOnly(false);
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//   };

//   const applyFilters = () => {
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//     fetchInventory();
//   };

//   useEffect(() => {
//     fetchInventory();
//   }, [fetchInventory]);

//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-IN').format(num || 0);
//   };

//   const getStockStatus = (stock, unit) => {
//     const currentStock = stock || 0;
//     if (currentStock <= 0) return { color: '#D32F2F', bg: '#FFEBEE', label: 'Out of Stock', icon: XCircle };
//     if (currentStock <= 10) return { color: '#FF6F00', bg: '#FFF3E0', label: 'Low Stock', icon: AlertTriangle };
//     return { color: '#2E7D32', bg: '#E8F5E9', label: 'In Stock', icon: CheckCircle };
//   };

//   const handleActionMenuOpen = (event, item) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedItemForMenu(item);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedItemForMenu(null);
//   };

//   // Smart dropdown positioning
//   const MENU_HEIGHT = 180;
//   const anchorRect = actionMenuAnchor?.getBoundingClientRect();
//   const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
//   const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

//   if (loading && inventory.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading inventory...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Inventory</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all stock levels</p>
//         </div>
//         <button
//           onClick={handleRefresh}
//           disabled={refreshing}
//           className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//           style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//         >
//           <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Products</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalProducts)}</p>
//             </div>
//             <Package className="w-8 h-8" style={{ color: '#43A047' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Stock (Units)</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)}</p>
//             </div>
//             <Warehouse className="w-8 h-8" style={{ color: '#FF8F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Low Stock Items</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: stats.lowStockCount > 0 ? '#FF6F00' : '#2E7D32' }}>{stats.lowStockCount}</p>
//             </div>
//             <AlertTriangle className="w-8 h-8" style={{ color: '#FF6F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Warehouses</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.warehouseCount}</p>
//             </div>
//             <Building className="w-8 h-8" style={{ color: '#1976D2' }} />
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchInventory} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4 items-center justify-between">
//           {/* Search Box */}
//           <div className="w-80">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//               <input
//                 type="text"
//                 placeholder="Search products..."
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
//               {(warehouseFilter || lowStockOnly) && (
//                 <span className="w-2 h-2 rounded-full bg-orange-500"></span>
//               )}
//             </button>
//             <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//             <button 
//               onClick={() => navigate('/inventory/adjust')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//               style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//             >
//               <Plus className="w-4 h-4" />
//               Adjust Stock
//             </button>
//             <button 
//               onClick={() => navigate('/inventory/transfer')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//               style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}
//             >
//               <ArrowLeftRight className="w-4 h-4" />
//               Transfer Stock
//             </button>
//           </div>
//         </div>

//         {/* Filter Panel */}
//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Warehouse</label>
//                 <select
//                   value={warehouseFilter}
//                   onChange={(e) => setWarehouseFilter(e.target.value)}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="">All Warehouses</option>
//                   {warehouses.map(warehouse => (
//                     <option key={warehouse} value={warehouse}>{warehouse}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Low Stock Only</label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={lowStockOnly}
//                     onChange={(e) => setLowStockOnly(e.target.checked)}
//                     className="w-4 h-4 rounded"
//                     style={{ accentColor: '#2E7D32' }}
//                   />
//                   <span className="text-sm">Show only products with stock ≤ 10 units</span>
//                 </label>
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

//       {/* Inventory Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
//             <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
//           </div>
//         ) : inventory.length === 0 ? (
//           <div className="text-center py-12">
//             <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//             <p className="text-sm" style={{ color: '#8D6E63' }}>No inventory items found</p>
//             {(searchTerm || warehouseFilter || lowStockOnly) && (
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
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Product</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Warehouse</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Current Stock</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Unit</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Last Updated</th>
//                     <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {inventory.map((item, index) => {
//                     const currentStock = item.currentStock || item.stock || 0;
//                     const stockStatus = getStockStatus(currentStock, item.unit);
//                     const StatusIcon = stockStatus.icon;
//                     const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedItemForMenu?._id === item._id;
                    
//                     return (
//                       <tr 
//                         key={item._id || index} 
//                         className="hover:bg-green-50 transition-colors"
//                         style={{ 
//                           borderBottom: index !== inventory.length - 1 ? '1px solid #E8F5E9' : 'none'
//                         }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Package className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                             <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.productName || item.name}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                             <span className="text-sm" style={{ color: '#5D4037' }}>{item.warehouse}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`text-sm font-semibold ${currentStock <= 10 ? 'text-red-600' : 'text-green-800'}`}>
//                             {formatNumber(currentStock)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm" style={{ color: '#5D4037' }}>{item.unit || 'kg'}</span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
//                             background: stockStatus.bg,
//                             color: stockStatus.color
//                           }}>
//                             <StatusIcon className="w-3 h-3" />
//                             {stockStatus.label}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs" style={{ color: '#8D6E63' }}>
//                             {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={(e) => handleActionMenuOpen(e, item)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
//                             style={{ color: '#2E7D32' }}
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                             <span className="text-xs font-medium">Actions</span>
//                           </button>

//                           {/* Dropdown menu */}
//                           {isActionMenuOpen && anchorRect && (
//                             <div
//                               className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                               style={{
//                                 borderColor: '#E8F5E9',
//                                 width: '200px',
//                                 position: 'fixed',
//                                 top: openUpward
//                                   ? anchorRect.top - MENU_HEIGHT - 4
//                                   : anchorRect.bottom + 4,
//                                 left: anchorRect.left - 140,
//                               }}
//                             >
//                               {/* View Product Details */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/inventory/product/${item.productName || item.name}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#2E7D32' }}
//                               >
//                                 <Eye className="w-4 h-4" />
//                                 View Details
//                               </button>

//                               {/* Adjust Stock */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/inventory/adjust?product=${item.productName || item.name}&warehouse=${item.warehouse}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#FF6F00' }}
//                               >
//                                 <TrendingUp className="w-4 h-4" />
//                                 Adjust Stock
//                               </button>

//                               {/* Transfer Stock */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/inventory/transfer?product=${item.productName || item.name}&from=${item.warehouse}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#1976D2', borderColor: '#E8F5E9' }}
//                               >
//                                 <ArrowLeftRight className="w-4 h-4" />
//                                 Transfer Stock
//                               </button>
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-xs" style={{ color: '#8D6E63' }}>
//                   Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                   {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
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
//                       if (pagination.pages <= 5) pageNum = i + 1;
//                       else if (pagination.page <= 3) pageNum = i + 1;
//                       else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
//                       else pageNum = pagination.page - 2 + i;
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
//     </div>
//   );
// };

// export default Inventory;




// src/pages/inventory/Inventory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  TrendingUp, TrendingDown, Warehouse, XCircle,
  CheckCircle, AlertTriangle, Building, ArrowLeftRight, X,
  MoreVertical
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Inventory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    warehouseCount: 0
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedItemForMenu, setSelectedItemForMenu] = useState(null);

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

  // Fetch inventory items with pagination
  const fetchInventory = useCallback(async () => {
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
      if (warehouseFilter) queryParams.append('warehouse', warehouseFilter);
      if (lowStockOnly) queryParams.append('lowStock', 'true');
      
      const response = await fetch(`${BASE_URL}/inventory?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Check if response has pagination or if it's just an array
        let items = [];
        let paginationData = null;
        
        if (data.data && Array.isArray(data.data)) {
          items = data.data;
          paginationData = data.pagination;
        } else if (data.data && data.data.items) {
          items = data.data.items;
          paginationData = data.data.pagination;
        } else if (Array.isArray(data)) {
          items = data;
        } else if (data.items) {
          items = data.items;
          paginationData = data.pagination;
        }
        
        setInventory(items);
        
        // Set pagination if available
        if (paginationData) {
          setPagination({
            page: paginationData.page || 1,
            limit: paginationData.limit || 5,
            total: paginationData.total || items.length,
            pages: paginationData.pages || Math.ceil((paginationData.total || items.length) / (paginationData.limit || 5))
          });
        } else {
          // If no pagination from API, create client-side pagination info
          setPagination({
            ...pagination,
            total: items.length,
            pages: Math.ceil(items.length / pagination.limit)
          });
        }
        
        // Extract unique warehouses
        const uniqueWarehouses = [...new Set(items.map(item => item.warehouse).filter(Boolean))];
        setWarehouses(uniqueWarehouses);
        
        // Calculate stats
        const totalStock = items.reduce((sum, item) => sum + (item.currentStock || item.stock || 0), 0);
        const lowStockCount = items.filter(item => (item.currentStock || item.stock || 0) <= 10).length;
        
        setStats({
          totalProducts: paginationData?.total || items.length,
          totalStock,
          lowStockCount,
          warehouseCount: uniqueWarehouses.length
        });
      } else {
        setError(data.message || t('inventory.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, warehouseFilter, lowStockOnly, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setWarehouseFilter('');
    setLowStockOnly(false);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchInventory();
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const getStockStatus = (stock, unit) => {
    const currentStock = stock || 0;
    if (currentStock <= 0) return { color: '#D32F2F', bg: '#FFEBEE', label: t('inventory.status.outOfStock'), icon: XCircle };
    if (currentStock <= 10) return { color: '#FF6F00', bg: '#FFF3E0', label: t('inventory.status.lowStock'), icon: AlertTriangle };
    return { color: '#2E7D32', bg: '#E8F5E9', label: t('inventory.status.inStock'), icon: CheckCircle };
  };

  const handleActionMenuOpen = (event, item) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedItemForMenu(item);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedItemForMenu(null);
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 180;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('inventory.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('inventory.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('inventory.subtitle')}</p>
        </div>
        {/* <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
          style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button> */}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('inventory.stats.totalProducts')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalProducts)}</p>
            </div>
            <Package className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('inventory.stats.totalStock')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)}</p>
            </div>
            <Warehouse className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('inventory.stats.lowStockItems')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: stats.lowStockCount > 0 ? '#FF6F00' : '#2E7D32' }}>{stats.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('inventory.stats.warehouses')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.warehouseCount}</p>
            </div>
            <Building className="w-8 h-8" style={{ color: '#1976D2' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchInventory} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('inventory.searchPlaceholder')}
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
              {(warehouseFilter || lowStockOnly) && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            {/* <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button> */}
            <button 
              onClick={() => navigate('/inventory/adjust')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" />
              {t('inventory.buttons.adjustStock')}
            </button>
            <button 
              onClick={() => navigate('/inventory/transfer')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {t('inventory.buttons.transferStock')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('inventory.filters.warehouse')}</label>
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="">{t('inventory.filters.allWarehouses')}</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('inventory.filters.lowStockOnly')}</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#2E7D32' }}
                  />
                  <span className="text-sm">{t('inventory.filters.lowStockLabel')}</span>
                </label>
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

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('inventory.noItemsFound')}</p>
            {(searchTerm || warehouseFilter || lowStockOnly) && (
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.product')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.warehouse')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.currentStock')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.unit')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.lastUpdated')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('inventory.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, index) => {
                    const currentStock = item.currentStock || item.stock || 0;
                    const stockStatus = getStockStatus(currentStock, item.unit);
                    const StatusIcon = stockStatus.icon;
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedItemForMenu?._id === item._id;
                    
                    return (
                      <tr 
                        key={item._id || index} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== inventory.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.productName || item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{item.warehouse}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${currentStock <= 10 ? 'text-red-600' : 'text-green-800'}`}>
                            {formatNumber(currentStock)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#5D4037' }}>{item.unit || 'kg'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: stockStatus.bg,
                            color: stockStatus.color
                          }}>
                            <StatusIcon className="w-3 h-3" />
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs" style={{ color: '#8D6E63' }}>
                            {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, item)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {/* Dropdown menu */}
                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '200px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 140,
                              }}
                            >
                              {/* View Product Details */}
                              <button
                                onClick={() => {
                                  navigate(`/inventory/product/${item.productName || item.name}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>

                              {/* Adjust Stock */}
                              <button
                                onClick={() => {
                                  navigate(`/inventory/adjust?product=${item.productName || item.name}&warehouse=${item.warehouse}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <TrendingUp className="w-4 h-4" />
                                {t('inventory.buttons.adjustStock')}
                              </button>

                              {/* Transfer Stock */}
                              <button
                                onClick={() => {
                                  navigate(`/inventory/transfer?product=${item.productName || item.name}&from=${item.warehouse}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#1976D2', borderColor: '#E8F5E9' }}
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                                {t('inventory.buttons.transferStock')}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('inventory.pagination.showing', {
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
                      if (pagination.pages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
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
    </div>
  );
};

export default Inventory;