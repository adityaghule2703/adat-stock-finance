// // src/pages/users/ViewUser.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   ArrowBack as ArrowBackIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Block as BlockIcon,
//   CheckCircle as CheckCircleIcon
// } from '@mui/icons-material';
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   Building,
//   CreditCard,
//   Calendar,
//   Shield,
//   Users,
//   Store,
//   Landmark,
//   Loader
// } from 'lucide-react';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';

// const ViewUser = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [statusDialogOpen, setStatusDialogOpen] = useState(false);
//   const [updating, setUpdating] = useState(false);

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

//   const fetchUser = async () => {
//     if (!isAuthenticated()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getToken();
//       const response = await axios.get(`${BASE_URL}/auth/all?page=1&limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       if (response.data.success) {
//         const foundUser = response.data.data.find(u => u.id === id);
//         if (foundUser) {
//           setUser(foundUser);
//         } else {
//           setError('User not found');
//         }
//       } else {
//         setError(response.data.message || 'Failed to fetch user details');
//       }
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//   }, [id]);

//   const handleDelete = async () => {
//     setUpdating(true);
//     try {
//       const token = getToken();
//       const response = await axios.delete(`${BASE_URL}/auth/${id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       if (response.data.success) {
//         setDeleteDialogOpen(false);
//         navigate('/users');
//       } else {
//         setError(response.data.message || 'Failed to delete user');
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       setError(error.response?.data?.message || 'Network error. Please try again.');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleToggleStatus = async () => {
//     setUpdating(true);
//     try {
//       const token = getToken();
//       const response = await axios.patch(`${BASE_URL}/auth/${id}/toggle-status`, {}, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       if (response.data.success) {
//         setUser(prev => ({ ...prev, isActive: !prev.isActive }));
//         setStatusDialogOpen(false);
//       } else {
//         setError(response.data.message || 'Failed to update user status');
//       }
//     } catch (error) {
//       console.error('Error updating user status:', error);
//       setError(error.response?.data?.message || 'Network error. Please try again.');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
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
//           <p style={{ color: '#8D6E63' }}>Loading user details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-red-600 mb-2">Error loading user: {error}</p>
//           <button 
//             onClick={fetchUser}
//             className="px-4 py-2 rounded-lg text-white"
//             style={{ background: '#2E7D32' }}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   const roleDetails = getRoleDetails(user.role);
//   const RoleIcon = roleDetails.icon;

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate('/users')}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             <ArrowBackIcon className="w-5 h-5" style={{ color: '#2E7D32' }} />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>User Details</h1>
//             <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>View complete user information</p>
//           </div>
//         </div>
//       </div>

//       {/* User Profile Header */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
//           <div className="flex items-center gap-4 flex-wrap">
//             <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
//               <span className="text-2xl font-bold" style={{ color: '#2E7D32' }}>
//                 {getInitials(user.name)}
//               </span>
//             </div>
//             <div className="flex-1">
//               <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
//                   style={{ background: roleDetails.bg, color: roleDetails.color }}>
//                   <RoleIcon className="w-3 h-3" />
//                   {roleDetails.label}
//                 </span>
//                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
//                   style={{ background: user.isActive ? '#E8F5E9' : '#FFEBEE', color: user.isActive ? '#2E7D32' : '#D32F2F' }}>
//                   {user.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <BlockIcon className="w-3 h-3" />}
//                   {user.isActive ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//               <p className="text-white/90 text-sm flex items-center gap-1">
//                 <Mail className="w-4 h-4" />
//                 {user.email}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Personal Information */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl p-6 shadow-sm">
//             <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//               <User className="w-5 h-5" /> Personal Information
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Full Name</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.name}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Email Address</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Mail className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.email}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Phone Number</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.phone || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Role</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <RoleIcon className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{roleDetails.label}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Status</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   {user.isActive ? <CheckCircleIcon className="w-4 h-4" style={{ color: '#2E7D32' }} /> : <BlockIcon className="w-4 h-4" style={{ color: '#D32F2F' }} />}
//                   <span className="text-sm" style={{ color: user.isActive ? '#2E7D32' : '#D32F2F' }}>
//                     {user.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Business Information */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//             <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//               <Building className="w-5 h-5" /> Business Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Business Name</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.businessName || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>GST Number</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.gstNumber || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>PAN Number</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.panNumber || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>City</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.city || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>State</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.state || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Address</label>
//                 <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.address || 'Not provided'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bank Details */}
//           <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//             <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//               <Landmark className="w-5 h-5" /> Bank Details
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Bank Name</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.bankName || 'Not provided'}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Account Number</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <CreditCard className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>
//                     {user.bankAccountNumber ? `****${user.bankAccountNumber.slice(-4)}` : 'Not provided'}
//                   </span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>IFSC Code</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.ifscCode || 'Not provided'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* System Information */}
//           <div className="bg-white rounded-xl p-6 shadow-sm">
//             <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
//               <Calendar className="w-5 h-5" /> System Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Created At</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(user.createdAt)}</span>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Last Updated</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(user.updatedAt)}</span>
//                 </div>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>Last Login</label>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <span className="text-sm" style={{ color: '#2E7D32' }}>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never logged in'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

    

//       {/* Delete Confirmation Dialog */}
//       {deleteDialogOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
//             <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: '#D32F2F' }}>
//               <DeleteIcon className="w-5 h-5" /> Delete User
//             </h3>
//             <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
//               Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
//               <br /><br />
//               All data associated with this user will be permanently removed.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setDeleteDialogOpen(false)}
//                 className="px-4 py-2 rounded-lg text-sm"
//                 style={{ color: '#8D6E63' }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 disabled={updating}
//                 className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
//                 style={{ background: '#D32F2F' }}
//               >
//                 {updating ? 'Deleting...' : 'Delete User'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Toggle Confirmation Dialog */}
//       {statusDialogOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
//             <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: user.isActive ? '#FF6F00' : '#2E7D32' }}>
//               {user.isActive ? <BlockIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
//               {user.isActive ? 'Deactivate User' : 'Activate User'}
//             </h3>
//             <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
//               Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} <strong>{user.name}</strong>?
//               <br /><br />
//               {user.isActive 
//                 ? 'Deactivated users will not be able to access the system.'
//                 : 'Activated users will regain full access to the system.'}
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setStatusDialogOpen(false)}
//                 className="px-4 py-2 rounded-lg text-sm"
//                 style={{ color: '#8D6E63' }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleToggleStatus}
//                 disabled={updating}
//                 className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
//                 style={{ background: user.isActive ? '#FF6F00' : '#2E7D32' }}
//               >
//                 {updating ? 'Processing...' : (user.isActive ? 'Deactivate' : 'Activate')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewUser;



// src/pages/users/ViewUser.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  Shield,
  Users,
  Store,
  Landmark,
  Loader
} from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config/Config';

const ViewUser = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const fetchUser = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/auth/all?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        const foundUser = response.data.data.find(u => u.id === id);
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError(t('users.errors.notFound'));
        }
      } else {
        setError(response.data.message || t('users.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    setUpdating(true);
    try {
      const token = getToken();
      const response = await axios.delete(`${BASE_URL}/auth/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        setDeleteDialogOpen(false);
        navigate('/users');
      } else {
        setError(response.data.message || t('users.errors.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || t('common.networkError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    setUpdating(true);
    try {
      const token = getToken();
      const response = await axios.patch(`${BASE_URL}/auth/${id}/toggle-status`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        setUser(prev => ({ ...prev, isActive: !prev.isActive }));
        setStatusDialogOpen(false);
      } else {
        setError(response.data.message || t('users.errors.statusToggleFailed'));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(error.response?.data?.message || t('common.networkError'));
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
          <p style={{ color: '#8D6E63' }}>{t('users.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t('users.errors.loadError')}: {error}</p>
          <button 
            onClick={fetchUser}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: '#2E7D32' }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleDetails = getRoleDetails(user.role);
  const RoleIcon = roleDetails.icon;

  // Action buttons component (not shown in UI currently, but kept for potential future use)
  const ActionButtons = () => (
    <div className="flex gap-2">
      <button 
        onClick={() => navigate(`/users/edit/${user.id}`)}
        className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
      >
        <EditIcon className="w-4 h-4" /> {t('common.edit')}
      </button>
      <button 
        onClick={() => setStatusDialogOpen(true)}
        className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
        style={{ background: user.isActive ? 'linear-gradient(135deg, #FF6F00, #FF8F00)' : 'linear-gradient(135deg, #2E7D32, #43A047)' }}
      >
        {user.isActive ? <BlockIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
        {user.isActive ? t('users.buttons.deactivate') : t('users.buttons.activate')}
      </button>
      <button 
        onClick={() => setDeleteDialogOpen(true)}
        className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
        style={{ background: '#D32F2F' }}
      >
        <DeleteIcon className="w-4 h-4" /> {t('common.delete')}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowBackIcon className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('users.detailsTitle')}</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('users.detailsSubtitle')}</p>
          </div>
        </div>
        <ActionButtons />
      </div>

      {/* User Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold" style={{ color: '#2E7D32' }}>
                {getInitials(user.name)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: roleDetails.bg, color: roleDetails.color }}>
                  <RoleIcon className="w-3 h-3" />
                  {roleDetails.label}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: user.isActive ? '#E8F5E9' : '#FFEBEE', color: user.isActive ? '#2E7D32' : '#D32F2F' }}>
                  {user.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <BlockIcon className="w-3 h-3" />}
                  {user.isActive ? t('users.status.active') : t('users.status.inactive')}
                </span>
              </div>
              <p className="text-white/90 text-sm flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <User className="w-5 h-5" /> {t('users.personalInfo')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('users.fullName')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('common.email')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Mail className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.mobileNumber')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.phone || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('users.role')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <RoleIcon className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{roleDetails.label}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('common.status')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  {user.isActive ? <CheckCircleIcon className="w-4 h-4" style={{ color: '#2E7D32' }} /> : <BlockIcon className="w-4 h-4" style={{ color: '#D32F2F' }} />}
                  <span className="text-sm" style={{ color: user.isActive ? '#2E7D32' : '#D32F2F' }}>
                    {user.isActive ? t('users.status.active') : t('users.status.inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <Building className="w-5 h-5" /> {t('users.businessInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.businessName')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.businessName || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.gstNumber')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.gstNumber || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.panNumber')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.panNumber || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.city')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.city || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.state')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.state || t('common.notProvided')}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.address')}</label>
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.address || t('common.notProvided')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <Landmark className="w-5 h-5" /> {t('farmers.bankDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.bankName')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.bankName || t('common.notProvided')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.accountNumber')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <CreditCard className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>
                    {user.bankAccountNumber ? `****${user.bankAccountNumber.slice(-4)}` : t('common.notProvided')}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('farmers.ifscCode')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.ifscCode || t('common.notProvided')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <Calendar className="w-5 h-5" /> {t('users.systemInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('users.createdAt')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('users.updatedAt')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(user.updatedAt)}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('users.lastLogin')}</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                  <span className="text-sm" style={{ color: '#2E7D32' }}>{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('users.neverLogged')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: '#D32F2F' }}>
              <DeleteIcon className="w-5 h-5" /> {t('users.modals.delete.title')}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
              {t('users.modals.delete.confirmMessage', { name: user.name })}
              <br /><br />
              {t('users.modals.delete.warningMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                style={{ background: '#D32F2F' }}
              >
                {updating ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Dialog */}
      {statusDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: user.isActive ? '#FF6F00' : '#2E7D32' }}>
              {user.isActive ? <BlockIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
              {user.isActive ? t('users.modals.deactivate.title') : t('users.modals.activate.title')}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#8D6E63' }}>
              {user.isActive 
                ? t('users.modals.deactivate.confirmMessage', { name: user.name })
                : t('users.modals.activate.confirmMessage', { name: user.name })}
              <br /><br />
              {user.isActive 
                ? t('users.modals.deactivate.warningMessage')
                : t('users.modals.activate.warningMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                style={{ background: user.isActive ? '#FF6F00' : '#2E7D32' }}
              >
                {updating ? t('common.processing') : (user.isActive ? t('users.buttons.deactivate') : t('users.buttons.activate'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUser;