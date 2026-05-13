// src/pages/sales/AddSale.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Inventory as PackageIcon,
  Percent as PercentIcon,
  Payment as PaymentIcon,
  Description as FileTextIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight
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

const AddSale = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerMobile: '',
    buyerGst: '',
    saleDate: new Date().toISOString().split('T')[0],
    lines: [
      {
        warehouseId: null,
        warehouseName: '',
        productId: null,
        productName: '',
        qty: 1,
        sellingPrice: 0,
        lineTotal: 0,
        availableStock: 0,
        unit: ''
      }
    ],
    gstPercent: 18,
    paymentMode: 'cash',
    referenceNumber: '',
    notes: ''
  });

  const [calculations, setCalculations] = useState({
    subTotal: 0,
    gstAmount: 0,
    grandTotal: 0
  });

  const steps = ['Buyer Information', 'Products', 'GST & Payment'];

  const getToken = () => localStorage.getItem('token');

 // Fetch warehouses with their products
const fetchWarehouses = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${BASE_URL}/warehouse`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data.success && response.data.data) {
      setWarehouses(response.data.data);
    } else {
      // FIX: Check for both 'message' and 'error' fields
      const errorMessage = response.data.message || response.data.error || 'Failed to load warehouse data';
      setError(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    // FIX: Better error extraction from catch block
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to load warehouse data';
    setError(errorMessage);
  } finally {
    setLoadingData(false);
  }
};

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Calculate totals whenever lines or GST changes
  useEffect(() => {
    let subTotal = 0;
    const updatedLines = [...formData.lines];
    
    updatedLines.forEach((line, idx) => {
      const total = (line.qty || 0) * (line.sellingPrice || 0);
      updatedLines[idx].lineTotal = total;
      subTotal += total;
    });
    
    const gstAmount = (subTotal * formData.gstPercent) / 100;
    const grandTotal = subTotal + gstAmount;
    
    setCalculations({ subTotal, gstAmount, grandTotal });
    
    // Update lines without triggering infinite loop
    if (JSON.stringify(updatedLines) !== JSON.stringify(formData.lines)) {
      setFormData(prev => ({ ...prev, lines: updatedLines }));
    }
  }, [formData.lines, formData.gstPercent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle warehouse selection for a line
  const handleWarehouseChange = (index, warehouse) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = {
      ...updatedLines[index],
      warehouseId: warehouse?._id || null,
      warehouseName: warehouse?.name || '',
      productId: null,
      productName: '',
      availableStock: 0,
      unit: '',
      qty: 1,
      sellingPrice: 0,
      lineTotal: 0
    };
    setFormData(prev => ({ ...prev, lines: updatedLines }));
    
    if (fieldErrors[`line_${index}_warehouse`]) {
      setFieldErrors(prev => ({ ...prev, [`line_${index}_warehouse`]: '' }));
    }
    if (fieldErrors[`line_${index}_product`]) {
      setFieldErrors(prev => ({ ...prev, [`line_${index}_product`]: '' }));
    }
  };

  // Handle product selection for a line
  const handleProductChange = (index, product) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = {
      ...updatedLines[index],
      productId: product?._id || null,
      productName: product?.productName || '',
      availableStock: product?.currentStock || 0,
      unit: product?.unit || 'units',
      qty: 1,
      sellingPrice: 0,
      lineTotal: 0
    };
    setFormData(prev => ({ ...prev, lines: updatedLines }));
    
    if (fieldErrors[`line_${index}_product`]) {
      setFieldErrors(prev => ({ ...prev, [`line_${index}_product`]: '' }));
    }
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    
    // Validate quantity against available stock
    if (field === 'qty' && value > updatedLines[index].availableStock) {
      setFieldErrors(prev => ({ 
        ...prev, 
        [`line_${index}_qty`]: `Only ${updatedLines[index].availableStock} ${updatedLines[index].unit} available` 
      }));
    } else if (field === 'qty') {
      setFieldErrors(prev => ({ ...prev, [`line_${index}_qty`]: '' }));
    }
    
    setFormData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { 
        warehouseId: null,
        warehouseName: '',
        productId: null,
        productName: '',
        qty: 1,
        sellingPrice: 0,
        lineTotal: 0,
        availableStock: 0,
        unit: ''
      }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      setFormData(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.buyerName) {
        errors.buyerName = 'Buyer name is required';
        isValid = false;
      }
      if (!formData.buyerMobile) {
        errors.buyerMobile = 'Mobile number is required';
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(formData.buyerMobile)) {
        errors.buyerMobile = 'Enter valid 10-digit mobile number';
        isValid = false;
      }
      if (!formData.saleDate) {
        errors.saleDate = 'Sale date is required';
        isValid = false;
      }
    } else if (step === 1) {
      formData.lines.forEach((line, idx) => {
        if (!line.warehouseName) errors[`line_${idx}_warehouse`] = 'Warehouse required';
        if (!line.productName) errors[`line_${idx}_product`] = 'Product required';
        if (!line.qty || line.qty <= 0) errors[`line_${idx}_qty`] = 'Valid quantity required';
        if (line.qty > line.availableStock) errors[`line_${idx}_qty`] = `Only ${line.availableStock} ${line.unit} available`;
        if (!line.sellingPrice || line.sellingPrice <= 0) errors[`line_${idx}_price`] = 'Valid price required';
      });
    } else if (step === 2) {
      if ((formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && !formData.referenceNumber) {
        errors.referenceNumber = 'Reference number is required';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields correctly');
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.buyerName) {
      errors.buyerName = 'Buyer name is required';
      isValid = false;
    }
    if (!formData.buyerMobile) {
      errors.buyerMobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.buyerMobile)) {
      errors.buyerMobile = 'Enter valid 10-digit mobile number';
      isValid = false;
    }
    if (!formData.saleDate) {
      errors.saleDate = 'Sale date is required';
      isValid = false;
    }
    
    formData.lines.forEach((line, idx) => {
      if (!line.warehouseName) errors[`line_${idx}_warehouse`] = 'Warehouse required';
      if (!line.productName) errors[`line_${idx}_product`] = 'Product required';
      if (!line.qty || line.qty <= 0) errors[`line_${idx}_qty`] = 'Valid quantity required';
      if (line.qty > line.availableStock) errors[`line_${idx}_qty`] = `Only ${line.availableStock} ${line.unit} available`;
      if (!line.sellingPrice || line.sellingPrice <= 0) errors[`line_${idx}_price`] = 'Valid price required';
    });

    if ((formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && !formData.referenceNumber) {
      errors.referenceNumber = 'Reference number is required';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields correctly');
    }
    return isValid;
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

 const handleSubmit = async () => {
  if (!validateAllFields()) return;

  setLoading(true);
  setError('');

  try {
    const token = getToken();
    
    const saleData = {
      buyerName: formData.buyerName,
      buyerMobile: formData.buyerMobile,
      buyerGst: formData.buyerGst || undefined,
      saleDate: formData.saleDate,
      lines: formData.lines.map(line => ({
        productName: line.productName,
        warehouse: line.warehouseName,
        qty: parseFloat(line.qty),
        sellingPrice: parseFloat(line.sellingPrice)
      })),
      gstPercent: parseFloat(formData.gstPercent),
      paymentMode: formData.paymentMode,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined
    };

    const response = await axios.post(`${BASE_URL}/sales`, saleData, {
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
      setTimeout(() => navigate('/sales'), 2000);
    } else {
      // FIX: Check for both 'message' and 'error' fields
      const errorMessage = response.data.message || response.data.error || 'Failed to create sale';
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Error creating sale:', error);
    // FIX: Better error extraction from catch block
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

  const paymentModes = ['cash', 'upi', 'bank', 'cheque'];

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
        <Typography sx={{ ml: 2, color: '#2E7D32' }}>Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/sales')} 
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
            New Sale
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Create a new sale invoice
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          {currentStep === 2 && (
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
              {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Create Sale</>}
            </Button>
          )}
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Sale created successfully! Redirecting...
        </Alert>
      )}

      {/* Stepper */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" spacing={3} alignItems="center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  ...(currentStep >= index 
                    ? { background: 'linear-gradient(135deg, #2E7D32, #43A047)', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } 
                    : { bgcolor: '#E5E7EB', color: '#6B7280' })
                }}>
                  {currentStep > index ? <CheckIcon sx={{ fontSize: '1rem' }} /> : index + 1}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: currentStep >= index ? '#2E7D32' : '#8D6E63', display: 'block', textAlign: 'left' }}>
                    Step {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: currentStep >= index ? '#1B5E20' : '#8D6E63' }}>
                    {step}
                  </Typography>
                </Box>
              </Stack>
              {index < steps.length - 1 && (
                <Box sx={{ width: 48, height: 2, bgcolor: currentStep > index ? '#2E7D32' : '#E5E7EB' }} />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Box>

      {/* Step 1: Buyer Information */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Buyer Information</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Label required>BUYER NAME</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  placeholder="Enter buyer name"
                  error={!!fieldErrors.buyerName}
                  helperText={fieldErrors.buyerName}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Label required>MOBILE NUMBER</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="buyerMobile"
                  value={formData.buyerMobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  inputProps={{ maxLength: 10 }}
                  error={!!fieldErrors.buyerMobile}
                  helperText={fieldErrors.buyerMobile}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Label>GST NUMBER (Optional)</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="buyerGst"
                  value={formData.buyerGst}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Label required>SALE DATE</Label>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  error={!!fieldErrors.saleDate}
                  helperText={fieldErrors.saleDate}
                  sx={inputSx}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Products - Warehouse first, then Products */}
      {currentStep === 1 && (
        <Stack spacing={2.5}>
          {formData.lines.map((line, idx) => {
            // Find selected warehouse object
            const selectedWarehouse = warehouses.find(w => w._id === line.warehouseId);
            // Get products for selected warehouse
            const warehouseProducts = selectedWarehouse?.products || [];
            // Find selected product
            const selectedProduct = warehouseProducts.find(p => p.productName === line.productName);
            const lineTotal = (line.qty || 0) * (line.sellingPrice || 0);
            
            return (
              <Paper key={idx} sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                    <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Product {idx + 1}</Typography>
                  </Stack>
                  {formData.lines.length > 1 && (
                    <IconButton size="small" onClick={() => removeLine(idx)} sx={{ color: '#EF4444' }}>
                      <DeleteIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {/* Warehouse Selection - First */}
                    <Box>
                      <Label required>WAREHOUSE</Label>
                      <Autocomplete
                        fullWidth
                        options={warehouses}
                        value={selectedWarehouse || null}
                        onChange={(event, newValue) => handleWarehouseChange(idx, newValue)}
                        getOptionLabel={(option) => `${option.name} (${option.location?.city || 'N/A'})`}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Select warehouse"
                            error={!!fieldErrors[`line_${idx}_warehouse`]}
                            helperText={fieldErrors[`line_${idx}_warehouse`]}
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {option.name}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                                {option.location?.city || 'No location'}
                              </Typography>
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
                    </Box>

                    {/* Product Selection - Second (only shows products from selected warehouse) */}
                    <Box>
                      <Label required>PRODUCT NAME</Label>
                      <Autocomplete
                        fullWidth
                        options={warehouseProducts}
                        value={selectedProduct || null}
                        onChange={(event, newValue) => handleProductChange(idx, newValue)}
                        disabled={!line.warehouseName}
                        getOptionLabel={(option) => `${option.productName} (Stock: ${option.currentStock} ${option.unit})`}
                        isOptionEqualToValue={(option, value) => option.productName === value?.productName}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder={line.warehouseName ? "Search product..." : "Select warehouse first"}
                            error={!!fieldErrors[`line_${idx}_product`]}
                            helperText={fieldErrors[`line_${idx}_product`]}
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {option.productName}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                                Stock: {option.currentStock} {option.unit}
                              </Typography>
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
                      {line.warehouseName && warehouseProducts.length === 0 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#FF6F00', fontSize: '0.65rem' }}>
                          No products found in this warehouse.
                        </Typography>
                      )}
                    </Box>

                    {/* Quantity */}
                    <Box>
                      <Label required>QUANTITY</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.qty}
                        onChange={(e) => handleLineChange(idx, 'qty', parseFloat(e.target.value))}
                        disabled={!line.productName}
                        placeholder="Enter quantity"
                        error={!!fieldErrors[`line_${idx}_qty`]}
                        helperText={fieldErrors[`line_${idx}_qty`]}
                        sx={inputSx}
                        InputProps={{
                          endAdornment: line.unit && line.productName ? (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                                {line.unit}
                              </Typography>
                            </InputAdornment>
                          ) : null
                        }}
                      />
                      {line.availableStock > 0 && line.qty > line.availableStock && (
                        <Typography variant="caption" sx={{ color: '#FF6F00', fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                          Only {line.availableStock} {line.unit} available
                        </Typography>
                      )}
                    </Box>

                    {/* Selling Price */}
                    <Box>
                      <Label required>SELLING PRICE</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.sellingPrice}
                        onChange={(e) => handleLineChange(idx, 'sellingPrice', parseFloat(e.target.value))}
                        disabled={!line.productName}
                        placeholder="Enter price"
                        error={!!fieldErrors[`line_${idx}_price`]}
                        helperText={fieldErrors[`line_${idx}_price`]}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                      />
                    </Box>

                    {/* Line Total - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Box sx={{ p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Line Total:</Typography>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                            {formatCurrency(lineTotal)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}

          <Button 
            onClick={addLine} 
            variant="outlined" 
            fullWidth
            sx={{ 
              py: 1.5, 
              borderStyle: 'dashed', 
              borderColor: COLORS.border,
              color: COLORS.primary,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.75rem',
              '&:hover': { borderColor: COLORS.primary, bgcolor: COLORS.primaryLight }
            }}
          >
            <AddIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Add Another Product
          </Button>
        </Stack>
      )}

      {/* Step 3: GST & Payment */}
      {currentStep === 2 && (
        <Stack spacing={2.5}>
          {/* GST Details */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PercentIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>GST Details</Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Label required>GST PERCENTAGE (%)</Label>
                  <FormControl fullWidth size="small" sx={inputSx}>
                    <Select
                      name="gstPercent"
                      value={formData.gstPercent}
                      onChange={handleChange}
                    >
                      <MenuItem value={0} sx={{ fontSize: '0.75rem' }}>0%</MenuItem>
                      <MenuItem value={5} sx={{ fontSize: '0.75rem' }}>5%</MenuItem>
                      <MenuItem value={12} sx={{ fontSize: '0.75rem' }}>12%</MenuItem>
                      <MenuItem value={18} sx={{ fontSize: '0.75rem' }}>18%</MenuItem>
                      <MenuItem value={28} sx={{ fontSize: '0.75rem' }}>28%</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Payment Details */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Payment Details</Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>PAYMENT MODE</Label>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                    {paymentModes.map(mode => (
                      <Button
                        key={mode}
                        variant={formData.paymentMode === mode ? 'contained' : 'outlined'}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode }))}
                        sx={{
                          py: 0.75,
                          borderRadius: 1.5,
                          textTransform: 'capitalize',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          borderColor: COLORS.border,
                          ...(formData.paymentMode === mode && {
                            bgcolor: COLORS.primary,
                            '&:hover': { bgcolor: COLORS.primaryDark }
                          })
                        }}
                      >
                        {mode}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {(formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && (
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Label required>REFERENCE NUMBER</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      placeholder={formData.paymentMode === 'upi' ? 'UPI Transaction ID' : 'Bank Reference Number'}
                      error={!!fieldErrors.referenceNumber}
                      helperText={fieldErrors.referenceNumber}
                      sx={inputSx}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Summary Section */}
          <Paper sx={{ p: 2.5, bgcolor: COLORS.primaryLight, borderRadius: 2.5, border: `1px solid ${COLORS.primary}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.primaryDark, mb: 2, fontSize: '0.85rem' }}>
              Sale Summary
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Subtotal</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
                  {formatCurrency(calculations.subTotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>GST ({formData.gstPercent}%)</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
                  {formatCurrency(calculations.gstAmount)}
                </Typography>
              </Stack>
              <Box sx={{ pt: 1, mt: 1, borderTop: `1px solid ${COLORS.primary}` }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primaryDark }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                    {formatCurrency(calculations.grandTotal)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* Notes */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FileTextIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Notes</Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
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
          </Paper>
        </Stack>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        {currentStep > 0 && (
          <Button
            onClick={handlePrevious}
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
            <ChevronLeft sx={{ fontSize: '1rem', mr: 0.5 }} /> Previous
          </Button>
        )}
        {currentStep < 2 && (
          <Button
            onClick={handleNext}
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
              }
            }}
          >
            Next <ChevronRight sx={{ fontSize: '1rem', ml: 0.5 }} />
          </Button>
        )}
        {currentStep === 2 && <Box />}
      </Box>
    </Box>
  );
};

export default AddSale;