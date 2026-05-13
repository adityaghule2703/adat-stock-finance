// src/pages/budgetalerts/EditBudget.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Slider
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Notifications as AlertIcon,
  Description as NotesIcon,
  Check as CheckIcon,
  Lock as LockIcon
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

const EditBudget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    alertThreshold: 80,
    notes: ''
  });

  const categoryOptions = [
    { value: 'transport_logistics', label: 'Transport & Logistics' },
    { value: 'labour_wages', label: 'Labour & Wages' },
    { value: 'market_fees', label: 'Market Fees' },
    { value: 'storage_cold_chain', label: 'Storage & Cold Chain' },
    { value: 'shop_office', label: 'Shop & Office' },
    { value: 'repairs_maintenance', label: 'Repairs & Maintenance' },
    { value: 'banking_finance', label: 'Banking & Finance' },
    { value: 'marketing_misc', label: 'Marketing & Miscellaneous' }
  ];

  const getToken = () => localStorage.getItem('token');

  const fetchBudget = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/budget-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        const budget = response.data.data.find(b => b._id === id);
        if (budget) {
          setFormData({
            category: budget.category,
            monthlyLimit: budget.monthlyLimit,
            month: budget.month || new Date().getMonth() + 1,
            year: budget.year || new Date().getFullYear(),
            alertThreshold: budget.alertThreshold || 80,
            notes: budget.notes || ''
          });
        } else {
          setError('Budget not found');
        }
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      setError(error.response?.data?.message || 'Failed to fetch budget details');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMonthChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, month: newValue?.value || 1 }));
    if (fieldErrors.month) setFieldErrors(prev => ({ ...prev, month: '' }));
  };

  const handleYearChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, year: newValue?.value || new Date().getFullYear() }));
    if (fieldErrors.year) setFieldErrors(prev => ({ ...prev, year: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }
    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      errors.monthlyLimit = 'Please enter a valid budget amount';
      isValid = false;
    }
    if (!formData.month) {
      errors.month = 'Month is required';
      isValid = false;
    }
    if (!formData.year) {
      errors.year = 'Year is required';
      isValid = false;
    }
    if (!formData.alertThreshold || formData.alertThreshold < 0 || formData.alertThreshold > 100) {
      errors.alertThreshold = 'Alert threshold must be between 0 and 100';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields correctly');
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

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const payload = {
        category: formData.category,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        alertThreshold: parseInt(formData.alertThreshold),
        notes: formData.notes || undefined
      };

      const response = await axios.post(`${BASE_URL}/budget-alerts`, payload, {
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
        setTimeout(() => navigate('/budget-alerts'), 2000);
      } else {
        showError(response.data.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      showError(error.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
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

  // Get disabled input styling for readonly fields
  const disabledAutocompleteSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      backgroundColor: '#F5F5F5',
      '& fieldset': { borderColor: COLORS.border }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.secondary,
    }
  };

  // Get selected category for Autocomplete (disabled)
  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category) || null;

  // Get months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
  }));

  // Get selected month
  const selectedMonth = months.find(m => m.value === formData.month) || null;

  // Get years for dropdown (current year - 2 to current year + 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: (currentYear - 2 + i).toString()
  }));

  // Get selected year
  const selectedYear = years.find(y => y.value === formData.year) || null;

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
        <Typography sx={{ ml: 2, color: '#2E7D32' }}>Loading budget details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/budget-alerts')} 
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
            Edit Budget
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Update budget limit for {categoryOptions.find(c => c.value === formData.category)?.label || 'category'}
          </Typography>
        </Box>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            ml: 'auto',
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
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Update Budget</>}
        </Button>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Budget updated successfully! Redirecting...
        </Alert>
      )}

      {/* Form Content */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MoneyIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Budget Information</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Category - Readonly Autocomplete */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>CATEGORY</Label>
              <Autocomplete
                fullWidth
                options={categoryOptions}
                value={selectedCategory}
                disabled
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select expense category"
                    sx={disabledAutocompleteSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                  </li>
                )}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                <LockIcon sx={{ fontSize: '0.7rem', verticalAlign: 'middle', mr: 0.5 }} /> Category cannot be changed once set
              </Typography>
            </Box>

            {/* Monthly Limit */}
            <Box>
              <Label required>MONTHLY LIMIT</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="monthlyLimit"
                value={formData.monthlyLimit}
                onChange={handleChange}
                placeholder="Enter budget amount"
                error={!!fieldErrors.monthlyLimit}
                helperText={fieldErrors.monthlyLimit}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Box>

            {/* Empty space for alignment */}
            <Box />

            {/* Month - Autocomplete */}
            <Box>
              <Label required>MONTH</Label>
              <Autocomplete
                fullWidth
                options={months}
                value={selectedMonth}
                onChange={handleMonthChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select month"
                    error={!!fieldErrors.month}
                    helperText={fieldErrors.month}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
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

            {/* Year - Autocomplete */}
            <Box>
              <Label required>YEAR</Label>
              <Autocomplete
                fullWidth
                options={years}
                value={selectedYear}
                onChange={handleYearChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select year"
                    error={!!fieldErrors.year}
                    helperText={fieldErrors.year}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
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

            {/* Alert Threshold - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>ALERT THRESHOLD (%)</Label>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  value={formData.alertThreshold}
                  onChange={(e, newValue) => setFormData(prev => ({ ...prev, alertThreshold: newValue }))}
                  aria-labelledby="alert-threshold-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                  sx={{
                    flex: 1,
                    color: COLORS.primary,
                    '& .MuiSlider-thumb': {
                      backgroundColor: COLORS.primary,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: COLORS.border,
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.65rem',
                      color: COLORS.text.tertiary,
                    }
                  }}
                />
                <TextField
                  type="number"
                  size="small"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 0 }))}
                  sx={{ width: 80, ...inputSx }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#8D6E63', fontSize: '0.65rem' }}>
                You will be alerted when expenses reach this percentage of your budget
              </Typography>
              {fieldErrors.alertThreshold && <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.65rem' }}>{fieldErrors.alertThreshold}</Typography>}
            </Box>

            {/* Notes - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>NOTES (Optional)</Label>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this budget..."
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditBudget;