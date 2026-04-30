import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardMedia, CardContent,
  Button, IconButton, Grid, Snackbar, Alert,
} from '@mui/material';
import { Favorite, ShoppingCart, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

const NO_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUVGMkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOEI1Q0Y2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
};

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState(getWishlist());
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (wishlistIds.length === 0) { setProducts([]); return; }
    Promise.all(wishlistIds.map(id => api.get(`/products/${id}`).then(r => r.data).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)));
  }, [wishlistIds]);

  const removeFromWishlist = (id) => {
    const updated = wishlistIds.filter(wid => wid !== id);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddToCart = async (product) => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      setToast({ open: true, message: `${product.name} added to cart!`, severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to add to cart', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Favorite sx={{ color: '#EF4444', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={900} sx={{ color: '#1F2937' }}>My Wishlist</Typography>
        <Typography variant="body2" color="text.secondary">({products.length} items)</Typography>
      </Box>

      {products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Favorite sx={{ fontSize: 64, color: '#E5E7EB', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>Your wishlist is empty</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Save products you love by clicking the heart icon</Typography>
          <Button variant="contained" onClick={() => navigate('/')}
            sx={{ backgroundColor: '#4F46E5', borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                borderRadius: 2, border: '1px solid #E0E7FF',
                boxShadow: '0 2px 12px rgba(79,70,229,0.08)',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(79,70,229,0.14)' },
                transition: 'all 0.22s',
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img"
                    image={getImageUrl(product.image_url) || NO_IMG}
                    alt={product.name}
                    sx={{ height: 200, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                  <IconButton size="small" onClick={() => removeFromWishlist(product.id)}
                    sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { backgroundColor: '#FFF0F0' } }}>
                    <Favorite sx={{ color: '#EF4444', fontSize: 18 }} />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight={700} noWrap
                    sx={{ cursor: 'pointer', mb: 0.3, '&:hover': { color: '#4F46E5' } }}
                    onClick={() => navigate(`/product/${product.id}`)}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mb: 1 }}>{product.category}</Typography>
                  <Typography fontWeight={800} sx={{ color: '#4F46E5', fontSize: '1.05rem', mb: 1 }}>₹{product.price}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 'auto' }}>
                    <Button variant="contained" size="small" fullWidth
                      onClick={() => navigate(`/product/${product.id}`)}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', backgroundColor: '#4F46E5', boxShadow: 'none', '&:hover': { backgroundColor: '#4338CA' } }}>
                      Buy Now
                    </Button>
                    <IconButton size="small" onClick={() => handleAddToCart(product)}
                      sx={{ border: '1px solid #E0E7FF', borderRadius: 1.5, color: '#4F46E5', flexShrink: 0, '&:hover': { backgroundColor: '#EEF2FF' } }}>
                      <ShoppingCart sx={{ fontSize: 15 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeFromWishlist(product.id)}
                      sx={{ border: '1px solid #FEE2E2', borderRadius: 1.5, color: '#EF4444', flexShrink: 0, '&:hover': { backgroundColor: '#FFF0F0' } }}>
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wishlist;
