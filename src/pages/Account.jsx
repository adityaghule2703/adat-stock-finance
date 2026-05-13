// // src/pages/Account.jsx
// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { User, Mail, Phone, MapPin, Calendar, CreditCard, Building, Loader } from 'lucide-react';

// const Account = () => {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [profile, setProfile] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     gstNumber: '',
//     bankAccount: '',
//     ifscCode: '',
//     joinDate: '',
//     businessName: '',
//     city: '',
//     state: '',
//     panNumber: '',
//     bankName: ''
//   });

//   // Fetch user data from API
//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   const fetchUserData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://192.168.1.15:5001/api/auth/me', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch user data');
//       }

//       const data = await response.json();
      
//       if (data.success && data.user) {
//         const user = data.user;
//         const mappedProfile = {
//           name: user.name || '',
//           email: user.email || '',
//           phone: user.phone || '',
//           address: user.address || '',
//           gstNumber: user.gstNumber || '',
//           bankAccount: user.bankAccountNumber || '',
//           ifscCode: user.ifscCode || '',
//           joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
//           businessName: user.businessName || '',
//           city: user.city || '',
//           state: user.state || '',
//           panNumber: user.panNumber || '',
//           bankName: user.bankName || ''
//         };
//         setProfile(mappedProfile);
//       } else {
//         throw new Error('Invalid response structure');
//       }
//     } catch (err) {
//       console.error('Error fetching user data:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !profile.name) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
//           <p style={{ color: '#8D6E63' }}>Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !profile.name) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-red-600 mb-2">Error loading profile: {error}</p>
//           <button 
//             onClick={fetchUserData}
//             className="px-4 py-2 rounded-lg text-white"
//             style={{ background: '#2E7D32' }}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('account.title')}</h1>
//         <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('account.subtitle')}</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Profile Summary Card */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl p-6 shadow-sm text-center">
//             <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
//               <User className="w-12 h-12 text-white" />
//             </div>
//             <h2 className="text-xl font-bold" style={{ color: '#2E7D32' }}>{profile.name}</h2>
//             <p className="text-sm mt-1" style={{ color: '#FF6F00' }}>{profile.businessName || 'Member'}</p>
//             <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
//               <div className="flex justify-between text-sm py-2">
//                 <span style={{ color: '#8D6E63' }}>Member Since:</span>
//                 <span className="font-medium" style={{ color: '#2E7D32' }}>{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Profile Details Form */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl p-6 shadow-sm">
//             <h3 className="font-semibold mb-6" style={{ color: '#2E7D32' }}>Personal Information</h3>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Full Name</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.name}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Email</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Mail className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.email}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Phone</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.phone}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Business Name</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.businessName || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>City</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.city || 'N/A'}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>State</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.state || 'N/A'}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>PAN Number</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.panNumber || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Address</label>
//                 <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                   <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#8D6E63' }} />
//                   <span>{profile.address || 'N/A'}</span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>GST Number</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.gstNumber || 'N/A'}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Bank Name</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.bankName || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>Bank Account Number</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <CreditCard className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.bankAccount || 'N/A'}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>IFSC Code</label>
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
//                     <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     <span>{profile.ifscCode || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Account;




// src/pages/Account.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Building, Loader, AlertCircle } from 'lucide-react';
import BASE_URL from '../config/Config';

const Account = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    bankAccount: '',
    ifscCode: '',
    joinDate: '',
    businessName: '',
    city: '',
    state: '',
    panNumber: '',
    bankName: ''
  });

  // Fetch user data from API
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(t('account.errors.fetchFailed'));
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        const user = data.user;
        const mappedProfile = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          gstNumber: user.gstNumber || '',
          bankAccount: user.bankAccountNumber || '',
          ifscCode: user.ifscCode || '',
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
          businessName: user.businessName || '',
          city: user.city || '',
          state: user.state || '',
          panNumber: user.panNumber || '',
          bankName: user.bankName || ''
        };
        setProfile(mappedProfile);
      } else {
        throw new Error(t('account.errors.invalidResponse'));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
          <p style={{ color: '#8D6E63' }}>{t('account.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !profile.name) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2">{t('account.errors.loadError')}: {error}</p>
          <button 
            onClick={fetchUserData}
            className="px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
            style={{ background: '#2E7D32' }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('account.title')}</h1>
        <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('account.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#2E7D32' }}>{profile.name}</h2>
            <p className="text-sm mt-1" style={{ color: '#FF6F00' }}>{profile.businessName || t('account.member')}</p>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex justify-between text-sm py-2">
                <span style={{ color: '#8D6E63' }}>{t('account.memberSince')}:</span>
                <span className="font-medium" style={{ color: '#2E7D32' }}>{profile.joinDate ? formatDate(profile.joinDate) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-6" style={{ color: '#2E7D32' }}>{t('account.personalInfo')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.fullName')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('common.email')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Mail className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.phone')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.phone || t('common.notProvided')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.businessName')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.businessName || t('common.na')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.city')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.city || t('common.na')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.state')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.state || t('common.na')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.panNumber')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.panNumber || t('common.na')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.address')}</label>
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#8D6E63' }} />
                  <span>{profile.address || t('common.notProvided')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.gstNumber')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.gstNumber || t('common.na')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.bankName')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.bankName || t('common.na')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.bankAccountNumber')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <CreditCard className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.bankAccount ? `****${profile.bankAccount.slice(-4)}` : t('common.na')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.ifscCode')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                    <span>{profile.ifscCode || t('common.na')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;