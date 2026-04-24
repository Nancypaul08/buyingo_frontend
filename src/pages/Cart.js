import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, CardMedia, Button,
  Box, IconButton, Divider, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

const NO_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUVGMkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOEI1Q0Y2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const showToast = (message, severity = 'success') =>
    setToast({ open: true, message, severity });

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch {
      showToast('Error fetching cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch {
      showToast('Error updating quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('Item removed from cart');
    } catch {
      showToast('Error removing item', 'error');
    }
  };

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (cartItems.length === 0) return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <ShoppingCartOutlined sx={{ fontSize: 80, color: '#C7D2FE', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>Your cart is empty</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Add some products to get started</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Browse Products</Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Shopping Cart ({cartItems.length})</Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Cart Items */}
        <Box sx={{ flex: 1 }}>
          {cartItems.map(item => (
            <Card key={item.id} sx={{ mb: 2, borderRadius: 3, border: '1px solid #E0E7FF' }} elevation={0}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'flex-start' }}>
                  <CardMedia component="img"
                    image={getImageUrl(item.product.image_url) || NO_IMG}
                    alt={item.product.name}
                    sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, mb: 1 }}>
                      {item.product.category}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#4F46E5', fontSize: { xs: '1rem', md: '1.1rem' } }}>
                      ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                    <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E7FF', borderRadius: 2 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ px: 1, fontWeight: 700, minWidth: 24, textAlign: 'center', fontSize: '0.9rem' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Order Summary */}
        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E0E7FF', position: { md: 'sticky' }, top: { md: 80 } }} elevation={0}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
              {cartItems.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                    {item.product.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>₹{(item.product.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary">₹{total.toFixed(2)}</Typography>
              </Box>
              <Button variant="contained" fullWidth size="large"
                onClick={() => navigate('/checkout')}
                sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}>
                Proceed to Checkout
              </Button>
              <Button fullWidth sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}
                onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;
