// src/pages/inventory/TransferStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Autocomplete,
  CircularProgress,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  SwapHoriz as TransferIcon,
  Inventory as PackageIcon,
  Warehouse as BuildingIcon
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

const TransferStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedProduct = queryParams.get('product');
  const preSelectedFrom = queryParams.get('from');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProductStock, setSelectedProductStock] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    productName: preSelectedProduct || '',
    fromWarehouse: preSelectedFrom || '',
    toWarehouse: '',
    qty: ''
  });

  const getToken = () => localStorage.getItem('token');

 // Fetch inventory items to get product list
const fetchInventory = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${BASE_URL}/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data.success) {
      setProducts(response.data.data);
      if (preSelectedProduct) {
        const product = response.data.data.find(p => p.productName === preSelectedProduct);
        if (product) setSelectedProduct(product);
      }
    } else {
      // FIX: Check for both 'message' and 'error' fields
      const errorMessage = response.data.message || response.data.error || 'Failed to load inventory data';
      setError(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    // FIX: Better error extraction from catch block
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to load inventory data';
    setError(errorMessage);
  }
};

  // Fetch warehouses from warehouse API
const fetchWarehouses = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${BASE_URL}/warehouse`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data.success) {
      const warehouseNames = response.data.data.map(warehouse => warehouse.name);
      setWarehouses(warehouseNames);
    } else {
      // FIX: Check for both 'message' and 'error' fields before falling back
      const errorMessage = response.data.message || response.data.error || 'Failed to load warehouses from API';
      console.warn(errorMessage);
      
      // Fallback: try to get from inventory if warehouse API fails
      const token2 = getToken();
      const invResponse = await axios.get(`${BASE_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });
      if (invResponse.data.success) {
        const uniqueWarehouses = [...new Set(invResponse.data.data.map(item => item.warehouse))];
        setWarehouses(uniqueWarehouses);
      }
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    // Fallback: get warehouses from inventory
    try {
      const token2 = getToken();
      const invResponse = await axios.get(`${BASE_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      });
      if (invResponse.data.success) {
        const uniqueWarehouses = [...new Set(invResponse.data.data.map(item => item.warehouse))];
        setWarehouses(uniqueWarehouses);
      } else {
        // FIX: Handle inventory API error as well
        const fallbackErrorMessage = invResponse.data.message || invResponse.data.error || 'Failed to load warehouse data';
        setError(fallbackErrorMessage);
      }
    } catch (err) {
      console.error('Fallback also failed:', err);
      // FIX: Better error extraction for fallback error
      const fallbackErrorMsg = err.response?.data?.message || 
                               err.response?.data?.error || 
                               err.message || 
                               'Failed to load warehouse data';
      setError(fallbackErrorMsg);
    }
  }
};

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([fetchInventory(), fetchWarehouses()]);
      setLoadingData(false);
    };
    loadData();
  }, []);

  // Update stock info when product or source warehouse changes
  useEffect(() => {
    if (formData.productName && formData.fromWarehouse) {
      const product = products.find(
        p => p.productName === formData.productName && p.warehouse === formData.fromWarehouse
      );
      setSelectedProductStock(product);
    } else {
      setSelectedProductStock(null);
    }
  }, [formData.productName, formData.fromWarehouse, products]);

  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
    setFormData(prev => ({ ...prev, productName: newValue?.productName || '' }));
    if (fieldErrors.productName) setFieldErrors(prev => ({ ...prev, productName: '' }));
  };

  const handleFromWarehouseChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, fromWarehouse: newValue || '' }));
    if (fieldErrors.fromWarehouse) setFieldErrors(prev => ({ ...prev, fromWarehouse: '' }));
    // Reset destination warehouse if it's the same as source
    if (formData.toWarehouse === newValue) {
      setFormData(prev => ({ ...prev, toWarehouse: '' }));
    }
  };

  const handleToWarehouseChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, toWarehouse: newValue || '' }));
    if (fieldErrors.toWarehouse) setFieldErrors(prev => ({ ...prev, toWarehouse: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.productName) {
      errors.productName = 'Please select a product';
      isValid = false;
    }
    if (!formData.fromWarehouse) {
      errors.fromWarehouse = 'Please select source warehouse';
      isValid = false;
    }
    if (!formData.toWarehouse) {
      errors.toWarehouse = 'Please select destination warehouse';
      isValid = false;
    }
    if (formData.fromWarehouse === formData.toWarehouse) {
      errors.toWarehouse = 'Source and destination warehouses cannot be the same';
      isValid = false;
    }
    if (!formData.qty || parseFloat(formData.qty) <= 0) {
      errors.qty = 'Please enter a valid quantity';
      isValid = false;
    }
    if (selectedProductStock && parseFloat(formData.qty) > selectedProductStock.currentStock) {
      errors.qty = `Insufficient stock. Only ${selectedProductStock.currentStock} ${selectedProductStock.unit} available`;
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please correct the errors above');
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
    const transferData = {
      productName: formData.productName,
      fromWarehouse: formData.fromWarehouse,
      toWarehouse: formData.toWarehouse,
      qty: parseFloat(formData.qty)
    };

    const response = await axios.post(`${BASE_URL}/inventory/transfer`, transferData, {
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
      setTimeout(() => navigate('/inventory'), 2000);
    } else {
      // FIX: Check for both 'message' and 'error' fields
      const errorMessage = response.data.message || response.data.error || 'Failed to transfer stock';
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Error transferring stock:', error);
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

  // Get unique product names for dropdown
  const uniqueProductNames = [...new Set(products.map(p => p.productName))];
  
  // Get available destination warehouses (excluding source)
  const availableWarehouses = warehouses.filter(w => w !== formData.fromWarehouse);

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

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
        <Typography sx={{ ml: 2, color: '#2E7D32' }}>Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{  height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/inventory')} 
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
            Transfer Stock
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Move stock between warehouses
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
          Stock transferred successfully! Redirecting...
        </Alert>
      )}

      {/* Form Content */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TransferIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Transfer Details</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* PRODUCT SELECTION - First column */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>PRODUCT NAME</Label>
              <Autocomplete
                fullWidth
                options={uniqueProductNames}
                value={formData.productName || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, productName: newValue || '' }));
                  if (fieldErrors.productName) setFieldErrors(prev => ({ ...prev, productName: '' }));
                }}
                disabled={!!preSelectedProduct}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search and select a product"
                    error={!!fieldErrors.productName}
                    helperText={fieldErrors.productName}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => {
                  // Find all stock entries for this product across warehouses
                  const productStocks = products.filter(p => p.productName === option);
                  const totalStock = productStocks.reduce((sum, p) => sum + p.currentStock, 0);
                  const unit = productStocks[0]?.unit || 'units';
                  
                  return (
                    <li {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                          {option}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                          Total Stock: {totalStock} {unit}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
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

            {/* FROM WAREHOUSE - First column */}
            <Box>
              <Label required>FROM WAREHOUSE (Source)</Label>
              <Autocomplete
                fullWidth
                options={warehouses}
                value={formData.fromWarehouse || null}
                onChange={handleFromWarehouseChange}
                disabled={!!preSelectedFrom || warehouses.length === 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={warehouses.length === 0 ? 'No warehouses found' : 'Select source warehouse'}
                    error={!!fieldErrors.fromWarehouse}
                    helperText={fieldErrors.fromWarehouse}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => {
                  // Show stock info for selected product in this warehouse
                  const stockInfo = formData.productName 
                    ? products.find(p => p.productName === formData.productName && p.warehouse === option)
                    : null;
                  
                  return (
                    <li {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BuildingIcon sx={{ fontSize: '0.875rem', color: COLORS.text.tertiary }} />
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </Typography>
                        </Box>
                        {stockInfo && (
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#2E7D32' }}>
                            Stock: {stockInfo.currentStock} {stockInfo.unit}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
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
              {warehouses.length === 0 && !loadingData && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#FF6F00', fontSize: '0.65rem' }}>
                  No warehouses found. Please add a warehouse first.
                </Typography>
              )}
            </Box>

            {/* TO WAREHOUSE - Second column */}
            <Box>
              <Label required>TO WAREHOUSE (Destination)</Label>
              <Autocomplete
                fullWidth
                options={availableWarehouses}
                value={formData.toWarehouse || null}
                onChange={handleToWarehouseChange}
                disabled={!formData.fromWarehouse || availableWarehouses.length === 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={!formData.fromWarehouse ? 'Select source first' : 'Select destination warehouse'}
                    error={!!fieldErrors.toWarehouse}
                    helperText={fieldErrors.toWarehouse}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildingIcon sx={{ fontSize: '0.875rem', color: COLORS.text.tertiary }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {option}
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

            {/* QUANTITY - First column */}
            <Box>
              <Label required>QUANTITY TO TRANSFER</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                placeholder="Enter quantity"
                error={!!fieldErrors.qty}
                helperText={fieldErrors.qty}
                sx={inputSx}
              />
            </Box>

            {/* Empty space for alignment */}
            <Box />

            {/* Stock Info - spans both columns */}
            {selectedProductStock && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Box sx={{ p: 2, bgcolor: '#E3F2FD', borderRadius: 1.5, border: '1px solid #BBDEFB' }}>
                  <Typography variant="body2" sx={{ color: '#1565C0', fontSize: '0.75rem' }}>
                    <strong>Available Stock:</strong> {selectedProductStock.currentStock} {selectedProductStock.unit} in {selectedProductStock.warehouse}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Transfer Direction Visual - spans both columns */}
            {formData.fromWarehouse && formData.toWarehouse && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Box sx={{ p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BuildingIcon sx={{ fontSize: '1.5rem', color: COLORS.primary, mx: 'auto' }} />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: COLORS.primary, display: 'block', mt: 0.5 }}>
                      {formData.fromWarehouse}
                    </Typography>
                  </Box>
                  <TransferIcon sx={{ fontSize: '1.5rem', color: '#FF6F00' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <BuildingIcon sx={{ fontSize: '1.5rem', color: COLORS.primary, mx: 'auto' }} />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: COLORS.primary, display: 'block', mt: 0.5 }}>
                      {formData.toWarehouse}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Info Note - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Box sx={{ p: 2, bgcolor: '#FFF3E0', borderRadius: 1.5, border: '1px solid #FFE0B2' }}>
                <Typography variant="caption" sx={{ color: '#E65100', fontSize: '0.7rem' }}>
                  <strong>Note:</strong> Transferring stock will decrease quantity from source warehouse
                  and increase quantity in destination warehouse.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/inventory')}
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
            bgcolor: '#FF6F00',
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: '#E65100',
            },
            '&:disabled': {
              bgcolor: COLORS.border,
              color: COLORS.text.tertiary
            }
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><TransferIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Transfer Stock</>}
        </Button>
      </Box>
    </Box>
  );
};

export default TransferStock;