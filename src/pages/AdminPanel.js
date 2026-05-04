import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, Box,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton,
  Select, MenuItem, FormControl, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, InputLabel,
  Snackbar, Alert,
} from '@mui/material';
import { Add, Star, StarBorder, Edit, Delete, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

const CATEGORIES = [
  'Air Cooler', 'LED Lights', 'Routers', 'Fan', 'Heater', 'Iron Box',
  'Mattresses', 'Pillows', 'Bedsheet', 'Curtains', 'Study Table', 'Chair',
  'Water Bottles', 'Coffee Mugs', 'Buckets', 'Utensils', 'Lunch Box',
  'Formal Suits', 'Formal Shoes', 'Hangers', 'Shirts', 'T-Shirts',
  'Jeans', 'Trousers', 'Kurta', 'Saree', 'Jacket', 'Sweater',
  'Accessories', 'Bags', 'Watches', 'Sunglasses', 'Belts', 'Wallets',
  'Soft Toys', 'Books', 'Stationery', 'Sports Equipment', 'Gym Equipment',
  'Other',
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [userSearch, setUserSearch] = useState('');
  const navigate = useNavigate();

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.contact_number.includes(q);
  });

  const showToast = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/users'),
        api.get('/orders')
      ]);
      
      setProducts(productsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      condition: product.condition || 'Good',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
    });
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      let image_url = editProduct.image_url;

      if (newImageFile) {
        const formData = new FormData();
        formData.append('image', newImageFile);
        Object.entries({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          category: editForm.category,
          brand: editForm.brand,
          condition: editForm.condition,
          sizes: editForm.sizes,
          colors: editForm.colors,
        }).forEach(([k, v]) => formData.append(k, v));

        const res = await api.put(`/products/${editProduct.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        image_url = res.data.image_url;
      }

      await api.put(`/products/${editProduct.id}`, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        category: editForm.category,
        brand: editForm.brand,
        condition: editForm.condition,
        sizes: editForm.sizes,
        colors: editForm.colors,
        image_url,
      });
      showToast('Product updated successfully');
      setEditProduct(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update product', 'error');
    }
    setEditLoading(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      showToast('Product deleted');
      fetchData();
    } catch { showToast('Failed to delete product', 'error'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User deleted successfully');
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || 'Failed to delete user', 'error'); }
  };

  const toggleFeatured = async (productId) => {
    try {
      await api.put(`/admin/products/${productId}/feature`);
      fetchData();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'confirmed':
        return 'info';
      case 'placed':
        return 'warning';
      case 'sold_out':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading admin panel...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Panel</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/add-product')}
        >
          Add Product
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Products" />
        <Tab label="Users" />
        <Tab label="Orders" />
      </Tabs>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1">{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_sold ? 'Sold' : 'Available'}
                      color={product.is_sold ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => toggleFeatured(product.id)}
                      color={product.is_featured ? 'primary' : 'default'}
                    >
                      {product.is_featured ? <Star /> : <StarBorder />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => openEdit(product)}
                        sx={{ border: '1px solid #E0E7FF', borderRadius: 1.5 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}
                        sx={{ border: '1px solid #FEE2E2', borderRadius: 1.5 }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name, email or contact..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <Box component="span" sx={{ mr: 1, color: '#9CA3AF', display: 'flex' }}>
                    <Search fontSize="small" />
                  </Box>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F9FAFB' } }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: '#9CA3AF' }}>No users found</TableCell></TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                    <TableCell fontWeight={600}>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contact_number}</TableCell>
                    <TableCell>
                      <Chip label={user.is_verified ? 'Verified' : 'Unverified'} color={user.is_verified ? 'success' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.is_admin ? 'Admin' : 'Student'} color={user.is_admin ? 'primary' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {!user.is_admin && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {order.buyer?.full_name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.buyer?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {order.items?.map((item, index) => (
                        <Typography key={index} variant="body2">
                          {item.product?.name || 'Product'} (x{item.quantity})
                        </Typography>
                      )) || 'No items'}
                    </Box>
                  </TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.payment_method}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={['delivered', 'cancelled', 'sold_out'].includes(order.status)}
                      >
                        <MenuItem value="placed">Placed</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Edit Product Dialog ── */}
      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E0E7FF', pb: 2 }}>
          Edit Product
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Product Name" value={editForm.name || ''}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField fullWidth multiline rows={3} label="Description" value={editForm.description || ''}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Price (₹)" type="number" value={editForm.price || ''}
              onChange={e => setEditForm({ ...editForm, price: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField fullWidth label="Brand" value={editForm.brand || ''}
              onChange={e => setEditForm({ ...editForm, brand: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Category</InputLabel>
              <Select value={editForm.category || ''} label="Category"
                onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Condition</InputLabel>
              <Select value={editForm.condition || 'Good'} label="Condition"
                onChange={e => setEditForm({ ...editForm, condition: e.target.value })}>
                {['New','Like New','Good','Fair'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TextField fullWidth label="Sizes (comma separated, e.g. S,M,L,XL)" value={editForm.sizes || ''}
            onChange={e => setEditForm({ ...editForm, sizes: e.target.value })}
            placeholder="S, M, L, XL or leave empty"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField fullWidth label="Colors (comma separated, e.g. Red,Blue)" value={editForm.colors || ''}
            onChange={e => setEditForm({ ...editForm, colors: e.target.value })}
            placeholder="Red, Blue, Green or leave empty"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

          {/* Image Upload */}
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151' }}>Product Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img"
                src={newImagePreview || getImageUrl(editProduct?.image_url) || ''}
                alt="product"
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, border: '1px solid #E0E7FF', flexShrink: 0, backgroundColor: '#F9FAFB' }}
              />
              <Button variant="outlined" component="label" size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#4F46E5', color: '#4F46E5' }}>
                {newImageFile ? 'Change Image' : 'Upload New Image'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {newImageFile && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                  {newImageFile.name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEditProduct(null)} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#E0E7FF', color: '#374151' }}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, backgroundColor: '#4F46E5', '&:hover': { backgroundColor: '#4338CA' } }}>
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel; 