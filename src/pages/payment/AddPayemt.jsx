// src/pages/payment/AddPayment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Color constants
const COLORS = {
  primary: '#1B3A1F',
  primaryLight: '#E8F5E9',
  primaryDark: '#0E2A12',
  text: {
    primary: '#1B5E20',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF',
    lightMuted: 'rgba(255, 255, 255, 0.9)'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#1B3A1F'
  },
  border: '#E3E8EF'
};

// Floating Error Alert Component
const FloatingErrorAlert = ({ error, onClose }) => {
  if (!error) return null;
  
  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        variant="filled"
        onClose={onClose}
        icon={<ErrorIcon sx={{ fontSize: '1rem' }} />}
        sx={{
          mb: 2,
          borderRadius: 1.5,
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '& .MuiAlert-icon': {
            fontSize: '1rem',
            alignItems: 'center'
          },
          '& .MuiAlert-message': {
            py: 0.5,
            fontSize: '0.75rem'
          },
          '& .MuiAlert-action': {
            py: 0,
            alignItems: 'center'
          }
        }}
      >
        {error}
      </Alert>
    </Collapse>
  );
};

const AddPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedFarmerId = queryParams.get('farmerId');
  const preSelectedPurchaseId = queryParams.get('purchaseId');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [formData, setFormData] = useState({
    purchaseId: preSelectedPurchaseId || '',
    amount: '',
    paymentMode: 'cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    notes: ''
  });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchFarmers();
  }, []);

 const fetchFarmers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${BASE_URL}/farmers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data.success) {
      setFarmers(response.data.data);
      if (preSelectedFarmerId) {
        const farmer = response.data.data.find(f => f._id === preSelectedFarmerId);
        if (farmer) {
          setSelectedFarmer(farmer);
          await fetchPurchases(farmer._id);
        }
      }
    } else {
      const errorMessage = response.data.message || response.data.error || 'Failed to fetch farmers';
      setError(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching farmers:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch farmers';
    setError(errorMessage);
  } finally {
    setLoadingFarmers(false);
  }
};

 const fetchPurchases = async (farmerId) => {
  if (!farmerId) return;
  
  setLoadingPurchases(true);
  setError('');
  
  try {
    const token = getToken();
    const response = await axios.get(`${BASE_URL}/purchases?farmerId=${farmerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      localStorage.clear();
      navigate('/login');
      return;
    }

    if (response.data.success) {
      const pendingPurchases = response.data.data.filter(purchase => 
        purchase.amountDue > 0 && 
        ['saved', 'partial', 'draft'].includes(purchase.status)
      );
      
      setPurchases(pendingPurchases);
      
      if (preSelectedPurchaseId && pendingPurchases.length > 0) {
        const purchase = pendingPurchases.find(p => p._id === preSelectedPurchaseId);
        if (purchase) {
          setSelectedPurchase(purchase);
          setFormData(prev => ({ ...prev, amount: purchase.amountDue.toString() }));
        }
      }
    } else {
      const errorMessage = response.data.message || response.data.error || 'Failed to fetch purchases';
      setError(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching purchases:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch purchases';
    setError(errorMessage);
  } finally {
    setLoadingPurchases(false);
  }
};

  const handleFarmerChange = (event, newValue) => {
    setSelectedFarmer(newValue);
    setFormData(prev => ({ ...prev, purchaseId: '', amount: '' }));
    setSelectedPurchase(null);
    setPurchases([]);
    if (newValue) fetchPurchases(newValue._id);
  };

  const handlePurchaseChange = (event, newValue) => {
    setSelectedPurchase(newValue);
    if (newValue) {
      setFormData(prev => ({ 
        ...prev, 
        purchaseId: newValue._id, 
        amount: newValue.amountDue.toString() 
      }));
    } else {
      setFormData(prev => ({ ...prev, purchaseId: '', amount: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.purchaseId) {
      errors.purchaseId = 'Please select a purchase';
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    }
    if (!formData.paymentDate) {
      errors.paymentDate = 'Payment date is required';
      isValid = false;
    }
    
    if ((formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && !formData.referenceNumber) {
      errors.referenceNumber = 'Reference number is required';
      isValid = false;
    }
    
    // Add bank name validation for bank transfer mode
    if (formData.paymentMode === 'bank' && !formData.bankName) {
      errors.bankName = 'Bank name is required';
      isValid = false;
    }
    
    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeNumber) errors.chequeNumber = 'Cheque number is required';
      if (!formData.chequeDate) errors.chequeDate = 'Cheque date is required';
      if (!formData.bankName) errors.bankName = 'Bank name is required';
      isValid = isValid && !!formData.chequeNumber && !!formData.chequeDate && !!formData.bankName;
    }

    if (selectedPurchase && parseFloat(formData.amount) > selectedPurchase.amountDue) {
      errors.amount = `Amount cannot exceed pending amount of ${formatCurrency(selectedPurchase.amountDue)}`;
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please fill all required fields correctly');
    return isValid;
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

 const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  setError('');

  try {
    const token = getToken();
    const paymentData = {
      purchaseId: formData.purchaseId,
      amount: parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      paymentDate: formData.paymentDate,
      notes: formData.notes || undefined
    };

    if (formData.paymentMode === 'upi' || formData.paymentMode === 'bank') {
      paymentData.referenceNumber = formData.referenceNumber;
    }
    
    // Add bank name for bank transfer mode
    if (formData.paymentMode === 'bank' && formData.bankName) {
      paymentData.bankName = formData.bankName;
    }

    if (formData.paymentMode === 'cheque') {
      paymentData.chequeNumber = formData.chequeNumber;
      paymentData.chequeDate = formData.chequeDate;
      paymentData.bankName = formData.bankName;
    }

    const response = await axios.post(`${BASE_URL}/payments`, paymentData, {
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

    if (response.data.success) {
      setSuccess(true);
      setTimeout(() => navigate('/payments'), 2000);
    } else {
      const errorMessage = response.data.message || response.data.error || 'Failed to record payment';
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Network error. Please check your connection.';
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Label component
  const Label = ({ children, required }) => (
    <Typography sx={{ 
      fontSize: '0.7rem', 
      fontWeight: 600, 
      color: COLORS.text.secondary, 
      letterSpacing: '0.5px',
      mb: 0.5
    }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      '&::placeholder': {
        color: COLORS.text.tertiary,
        fontSize: '0.75rem'
      }
    }
  };

  const paymentModes = [
    { value: 'cash', label: 'Cash', icon: PaymentIcon, color: '#2E7D32' },
    { value: 'upi', label: 'UPI', icon: AccountBalanceIcon, color: '#1976D2' },
    { value: 'bank', label: 'Bank Transfer', icon: AccountBalanceIcon, color: '#F57C00' },
    { value: 'cheque', label: 'Cheque', icon: ReceiptIcon, color: '#7B1FA2' }
  ];

  return (
    <Box sx={{  height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/payments')} 
          sx={{ 
            p: 1, 
            borderRadius: 1.5,
            '&:hover': { bgcolor: COLORS.primaryLight }
          }}
        >
          <ArrowBackIcon sx={{ color: COLORS.primary }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
            Record Payment
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Record a new payment from farmer
          </Typography>
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Payment recorded successfully! Redirecting...
        </Alert>
      )}

      {/* Form Content */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CreditCardIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Payment Information</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* SELECT FARMER - First column */}
            <Box>
              <Label required>SELECT FARMER</Label>
              <Autocomplete
                fullWidth
                options={farmers}
                loading={loadingFarmers}
                value={selectedFarmer}
                onChange={handleFarmerChange}
                getOptionLabel={(option) => `${option.name} - ${option.mobile} (${option.village || option.city})`}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search and select a farmer"
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                          {option.mobile} • {option.village || option.city}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                          Pending Dues
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#FF6F00' }}>
                          {formatCurrency(option.pendingDues || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    overflowY: 'auto',
                    '& .MuiAutocomplete-option': {
                      fontSize: '0.75rem',
                      py: 1,
                      px: 1.5
                    }
                  }
                }}
              />
              {selectedFarmer && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Selected Farmer</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.text.primary }}>
                        {selectedFarmer.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                        {selectedFarmer.mobile}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Pending Dues</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#FF6F00' }}>
                        {formatCurrency(selectedFarmer.pendingDues || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* SELECT PURCHASE - Second column */}
            <Box>
              <Label required>SELECT PURCHASE</Label>
              <Autocomplete
                fullWidth
                options={purchases}
                loading={loadingPurchases}
                value={selectedPurchase}
                onChange={handlePurchaseChange}
                getOptionLabel={(option) => `${option.receiptNumber} - Due: ${formatCurrency(option.amountDue)} (${new Date(option.purchaseDate).toLocaleDateString()})`}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                disabled={!selectedFarmer}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={!selectedFarmer ? 'Select a farmer first' : (loadingPurchases ? 'Loading purchases...' : 'Select a purchase')}
                    error={!!fieldErrors.purchaseId}
                    helperText={fieldErrors.purchaseId}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                          {option.receiptNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                          Date: {new Date(option.purchaseDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                          Due Amount
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#FF6F00' }}>
                          {formatCurrency(option.amountDue)}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    overflowY: 'auto',
                    '& .MuiAutocomplete-option': {
                      fontSize: '0.75rem',
                      py: 1,
                      px: 1.5
                    }
                  }
                }}
              />
              {selectedPurchase && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#E3F2FD', borderRadius: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Purchase Details</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: '#1565C0' }}>
                        {selectedPurchase.receiptNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                        Date: {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Pending Amount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#FF6F00' }}>
                        {formatCurrency(selectedPurchase.amountDue)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* PAYMENT DATE - First column */}
            <Box>
              <Label required>PAYMENT DATE</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                error={!!fieldErrors.paymentDate}
                helperText={fieldErrors.paymentDate}
                sx={inputSx}
              />
            </Box>

            {/* AMOUNT - Second column */}
            <Box>
              <Label required>AMOUNT</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                error={!!fieldErrors.amount}
                helperText={fieldErrors.amount}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Box>

            {/* PAYMENT MODE - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>PAYMENT MODE</Label>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                {paymentModes.map(mode => {
                  const Icon = mode.icon;
                  const isSelected = formData.paymentMode === mode.value;
                  return (
                    <Button
                      key={mode.value}
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          paymentMode: mode.value,
                          // Clear bank name when switching from bank mode
                          ...(mode.value !== 'bank' && mode.value !== 'cheque' && { bankName: '' })
                        }));
                      }}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderColor: COLORS.border,
                        ...(isSelected && {
                          bgcolor: mode.color,
                          '&:hover': { bgcolor: mode.color }
                        })
                      }}
                    >
                      <Icon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {mode.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* UPI Fields */}
            {formData.paymentMode === 'upi' && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>REFERENCE NUMBER</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="UPI Transaction ID"
                  error={!!fieldErrors.referenceNumber}
                  helperText={fieldErrors.referenceNumber}
                  sx={inputSx}
                />
              </Box>
            )}

            {/* Bank Transfer Fields */}
            {formData.paymentMode === 'bank' && (
              <>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>REFERENCE NUMBER</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    placeholder="Transaction Reference Number"
                    error={!!fieldErrors.referenceNumber}
                    helperText={fieldErrors.referenceNumber}
                    sx={inputSx}
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>BANK NAME</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    error={!!fieldErrors.bankName}
                    helperText={fieldErrors.bankName}
                    sx={inputSx}
                  />
                </Box>
              </>
            )}

            {/* Cheque Fields */}
            {formData.paymentMode === 'cheque' && (
              <>
                <Box>
                  <Label required>CHEQUE NUMBER</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleChange}
                    placeholder="Cheque number"
                    error={!!fieldErrors.chequeNumber}
                    helperText={fieldErrors.chequeNumber}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Label required>CHEQUE DATE</Label>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleChange}
                    error={!!fieldErrors.chequeDate}
                    helperText={fieldErrors.chequeDate}
                    sx={inputSx}
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>BANK NAME</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Bank name"
                    error={!!fieldErrors.bankName}
                    helperText={fieldErrors.bankName}
                    sx={inputSx}
                  />
                </Box>
              </>
            )}

            {/* NOTES - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>NOTES</Label>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes..."
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/payments')}
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: COLORS.primary,
              bgcolor: `${COLORS.primary}10`
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            bgcolor: COLORS.primary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: COLORS.primaryDark,
            },
            '&:disabled': {
              bgcolor: COLORS.border,
              color: COLORS.text.tertiary
            }
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Record Payment'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddPayment;