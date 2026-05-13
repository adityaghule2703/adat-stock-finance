// src/pages/expenses/EditExpense.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Autocomplete,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Wallet as WalletIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  LocalShipping as TruckIcon,
  Work as BriefcaseIcon,
  AccountBalance as LandmarkIcon,
  Warehouse as WarehouseIcon,
  Business as BuildingIcon,
  Build as WrenchIcon,
  AccountBalance as BanknoteIcon,
  Campaign as MegaphoneIcon,
  ChevronRight,
  ChevronLeft,
  Edit as EditIcon
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

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [fetchError, setFetchError] = useState('');
  
  const [formData, setFormData] = useState({
    category: 'transport_logistics',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paidBy: 'cash',
    paidTo: '',
    referenceNumber: '',
    notes: ''
  });

  // Category options with icons
  const categoryOptions = [
    { value: 'transport_logistics', label: 'Transport & Logistics', icon: <TruckIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'labour_wages', label: 'Labour & Wages', icon: <BriefcaseIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'market_fees', label: 'Market Fees', icon: <LandmarkIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'storage_cold_chain', label: 'Storage & Cold Chain', icon: <WarehouseIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'shop_office', label: 'Shop & Office', icon: <BuildingIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'repairs_maintenance', label: 'Repairs & Maintenance', icon: <WrenchIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'banking_finance', label: 'Banking & Finance', icon: <BanknoteIcon sx={{ fontSize: '1rem' }} /> },
    { value: 'marketing_misc', label: 'Marketing & Miscellaneous', icon: <MegaphoneIcon sx={{ fontSize: '1rem' }} /> }
  ];

  // Payment options
  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const getToken = () => localStorage.getItem('token');

  // Fetch expense data
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/expenses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (response.data.success) {
          const expense = response.data.data;
          setFormData({
            category: expense.category || 'transport_logistics',
            amount: expense.amount || '',
            description: expense.description || '',
            expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
            paidBy: expense.paidBy || 'cash',
            paidTo: expense.paidTo || '',
            referenceNumber: expense.referenceNumber || '',
            notes: expense.notes || ''
          });
        } else {
          setFetchError(response.data.message || 'Failed to fetch expense details');
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
        setFetchError(error.response?.data?.message || 'Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, category: newValue?.value || 'transport_logistics' }));
    if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    }
    if (!formData.description) {
      errors.description = 'Description is required';
      isValid = false;
    }
    if (!formData.expenseDate) {
      errors.expenseDate = 'Expense date is required';
      isValid = false;
    }
    if (!formData.paidBy) {
      errors.paidBy = 'Payment method is required';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const token = getToken();
      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expenseDate: formData.expenseDate,
        paidBy: formData.paidBy,
        paidTo: formData.paidTo || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined
      };

      const response = await axios.put(`${BASE_URL}/expenses/${id}`, expenseData, {
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
        setTimeout(() => navigate('/expenses'), 2000);
      } else {
        showError(response.data.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      showError(error.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2
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

  // Get selected category for Autocomplete
  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category) || null;

  // Get icon for selected payment method
  const getPaymentIcon = (value) => {
    switch(value) {
      case 'cash': return <PaymentIcon sx={{ fontSize: '1rem' }} />;
      case 'upi': return <PaymentIcon sx={{ fontSize: '1rem' }} />;
      case 'bank': return <BanknoteIcon sx={{ fontSize: '1rem' }} />;
      case 'cheque': return <ReceiptIcon sx={{ fontSize: '1rem' }} />;
      default: return <PaymentIcon sx={{ fontSize: '1rem' }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {fetchError}
        </Alert>
        <Button
          onClick={() => navigate('/expenses')}
          sx={{ mt: 2 }}
        >
          Back to Expenses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/expenses')} 
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
            Edit Expense
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Update expense details
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button
            onClick={handleSubmit}
            disabled={saving}
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
            {saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Update Expense</>}
          </Button>
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Expense updated successfully! Redirecting...
        </Alert>
      )}

      {/* Expense Details Form */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Expense Details</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Category - Using Autocomplete like farmer dropdown */}
            <Box>
              <Label required>CATEGORY</Label>
              <Autocomplete
                fullWidth
                options={categoryOptions}
                value={selectedCategory}
                onChange={handleCategoryChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select expense category"
                    error={!!fieldErrors.category}
                    helperText={fieldErrors.category}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {option.icon}
                      <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                    </Box>
                  </li>
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    '& .MuiAutocomplete-option': {
                      fontSize: '0.75rem',
                      py: 1,
                      px: 1.5
                    }
                  }
                }}
              />
            </Box>

            {/* Amount */}
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

            {/* Description - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>DESCRIPTION</Label>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the expense"
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
                sx={inputSx}
              />
            </Box>

            {/* Expense Date */}
            <Box>
              <Label required>EXPENSE DATE</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                error={!!fieldErrors.expenseDate}
                helperText={fieldErrors.expenseDate}
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Payment Information */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}`, mt: 2.5 }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Payment Information</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Paid By */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>PAID BY</Label>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
                {paymentOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={formData.paidBy === option.value ? 'contained' : 'outlined'}
                    onClick={() => setFormData(prev => ({ ...prev, paidBy: option.value }))}
                    startIcon={getPaymentIcon(option.value)}
                    sx={{
                      py: 0.75,
                      borderRadius: 1.5,
                      textTransform: 'capitalize',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      borderColor: COLORS.border,
                      ...(formData.paidBy === option.value && {
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.primaryDark }
                      })
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
              {fieldErrors.paidBy && <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.65rem' }}>{fieldErrors.paidBy}</Typography>}
            </Box>

            {/* Paid To */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>PAID TO (Vendor/Person)</Label>
              <TextField
                fullWidth
                size="small"
                name="paidTo"
                value={formData.paidTo}
                onChange={handleChange}
                placeholder="Vendor or person name"
                sx={inputSx}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                }}
              />
            </Box>

            {/* Reference Number - Only show when payment method is NOT cash */}
            {formData.paidBy !== 'cash' && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>REFERENCE NUMBER</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="Bill/Invoice/Transaction No."
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>
            )}

            {/* Notes */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>NOTES (Optional)</Label>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Info Note */}
      <Paper sx={{ p: 2.5, bgcolor: '#E3F2FD', borderRadius: 2.5, border: '1px solid #BBDEFB', mt: 2.5 }}>
        <Typography variant="caption" sx={{ color: '#1565C0', fontSize: '0.7rem' }}>
          <strong>Note:</strong> Expenses under ₹1,000 will be auto-approved. Higher amounts require manager approval.
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/expenses')}
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
          disabled={saving}
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
          {saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Update Expense</>}
        </Button>
      </Box>
    </Box>
  );
};

export default EditExpense;