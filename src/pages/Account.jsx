// src/pages/Account.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, CreditCard, Building, Edit2, Save, X } from 'lucide-react';

const Account = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Rajesh Sharma',
    email: 'rajesh@agribroker.com',
    phone: '+91 98765 43210',
    address: '123, Market Yard, Pune, Maharashtra - 411001',
    dealerId: 'AGB-2024-001',
    gstNumber: '27AAAAA1234A1Z',
    bankAccount: 'XXXX-XXXX-1234',
    ifscCode: 'SBIN0012345',
    joinDate: '2024-01-15'
  });

  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    // Here you would typically make an API call to update the profile
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('account.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('account.subtitle')}</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Edit2 className="w-4 h-4" />
            {t('account.editProfile')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
              style={{ background: '#2E7D32' }}
            >
              <Save className="w-4 h-4" />
              {t('common.save')}
            </button>
            <button 
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border"
              style={{ borderColor: '#D84315', color: '#D84315' }}
            >
              <X className="w-4 h-4" />
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#2E7D32' }}>{profile.name}</h2>
            <p className="text-sm mt-1" style={{ color: '#FF6F00' }}>{t('account.masterDealer')}</p>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex justify-between text-sm py-2">
                <span style={{ color: '#8D6E63' }}>{t('account.dealerId')}:</span>
                <span className="font-medium" style={{ color: '#2E7D32' }}>{profile.dealerId}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span style={{ color: '#8D6E63' }}>{t('account.memberSince')}:</span>
                <span className="font-medium" style={{ color: '#2E7D32' }}>{new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2E7D32' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#FF6F00' }} />
              {t('account.financialSummary')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: '#8D6E63' }}>{t('account.totalPurchases')}:</span>
                <span className="font-bold" style={{ color: '#2E7D32' }}>₹12,50,000</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#8D6E63' }}>{t('account.totalSales')}:</span>
                <span className="font-bold" style={{ color: '#2E7D32' }}>₹18,75,000</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#E8F5E9' }}>
                <span style={{ color: '#8D6E63' }}>{t('account.commissionEarned')}:</span>
                <span className="font-bold" style={{ color: '#FF6F00' }}>₹1,87,500</span>
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
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9', outline: 'none' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.email')}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <Mail className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.phone')}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.gstNumber')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.address')}</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#C8E6C9' }}
                  />
                ) : (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                    <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#8D6E63' }} />
                    <span>{profile.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.bankAccount')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <CreditCard className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.bankAccount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E7D32' }}>{t('account.ifscCode')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#C8E6C9' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                      <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                      <span>{profile.ifscCode}</span>
                    </div>
                  )}
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