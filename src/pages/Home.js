import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Box, Chip, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Snackbar, Alert,
} from '@mui/material';
import {
  ShoppingCart, VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon, LocalOffer as LocalOfferIcon,
  Close, StorefrontOutlined, ArrowForward, Star,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

const TRUST = [
  { icon: <VerifiedUserIcon sx={{ fontSize: 32, color: 'white' }} />, title: '100% Verified Students', desc: 'Only verified college students can buy and sell, ensuring a trusted community.', color: '#10B981', check: 'College Verified' },
  { icon: <SecurityIcon sx={{ fontSize: 32, color: 'white' }} />, title: 'Reliable & Secure', desc: 'Advanced security measures protect your data and payments at every step.', color: '#4F46E5', check: 'Real-time Updates' },
  { icon: <LocalOfferIcon sx={{ fontSize: 32, color: 'white' }} />, title: 'Unbeatable Prices', desc: 'Find the best deals from fellow students and save money on quality items.', color: '#8B5CF6', check: 'Budget Friendly' },
];

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
    setCategories([
      { name: 'Air Cooler', image: '/images/categories/cooler.jpeg' },
      { name: 'Water Bottles', image: '/images/categories/bottle.jpeg' },
      { name: 'Coffee Mugs', image: '/images/categories/cup.jpeg' },
      { name: 'Buckets', image: '/images/categories/bucket.jpeg' },
      { name: 'Pillows', image: '/images/categories/pillow.jpeg' },
      { name: 'LED Lights', image: '/images/categories/led.jpeg' },
      { name: 'Routers', image: '/images/categories/router.jpeg' },
      { name: 'Mattresses', image: '/images/categories/mattress.jpeg' },
      { name: 'Formal Suits', image: '/images/categories/formals.jpeg' },
      { name: 'Formal Shoes', image: '/images/categories/formalShoes.jpeg' },
      { name: 'Hangers', image: '/images/categories/hanger.jpeg' },
      { name: 'Soft Toys', image: '/images/categories/softToy.jpeg' },
    ]);
  }, []);

  const fetchProducts = async () => {
    try { const res = await api.get('/products'); setAllProducts(res.data); }
    catch (e) {} finally { setLoading(false); }
  };

  const fetchFeaturedProducts = async () => {
    try { const res = await api.get('/products/featured'); setFeaturedProducts(res.data); }
    catch (e) {}
  };

  const handleAddToCart = async (product) => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      setToast({ open: true, message: `${product.name} added to cart`, severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to add to cart', severity: 'error' });
    }
  };

  const ProductCard = ({ product }) => (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 3, border: '1px solid #E0E7FF',
      boxShadow: '0 2px 12px rgba(79,70,229,0.07)',
      transition: 'all 0.25s ease', backgroundColor: 'white',
      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(79,70,229,0.15)', borderColor: '#A5B4FC' }
    }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia component="img" height="200"
          image={getImageUrl(product.image_url)} alt={product.name}
          sx={{ objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
          onClick={() => navigate(`/product/${product.id}`)}
        />
        {product.is_featured && (
          <Box sx={{
            position: 'absolute', top: 10, left: 10,
            background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
            borderRadius: 99, px: 1.2, py: 0.3,
            display: 'flex', alignItems: 'center', gap: 0.4,
          }}>
            <Star sx={{ fontSize: 12, color: 'white' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>Featured</Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}
          sx={{ cursor: 'pointer', mb: 0.5, color: '#1F2937', '&:hover': { color: '#4F46E5' } }}
          onClick={() => navigate(`/product/${product.id}`)}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 1.5, fontSize: '0.82rem' }}>
          {product.description?.substring(0, 75)}...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#4F46E5', fontSize: '1.2rem' }}>
            ₹{product.price}
          </Typography>
          <Chip label={product.category} size="small"
            sx={{ fontSize: '0.7rem', backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 600, border: 'none' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" fullWidth size="small"
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 0.9,
              backgroundColor: '#4F46E5', color: 'white',
              '&:hover': { backgroundColor: '#4338CA', boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },
              boxShadow: 'none',
            }}
            onClick={() => navigate(`/product/${product.id}`)}>
            Buy Now
          </Button>
          <Button variant="outlined" size="small"
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 0.9, minWidth: 44,
              borderColor: '#4F46E5', color: '#4F46E5', backgroundColor: 'white',
              '&:hover': { backgroundColor: '#EEF2FF', borderColor: '#4338CA' },
            }}
            onClick={() => handleAddToCart(product)}>
            <ShoppingCart fontSize="small" />
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #8B5CF6 100%)',
        color: 'white', py: { xs: 10, md: 14 }, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, px: 2, py: 0.8, backdropFilter: 'blur(10px)' }}>
            <StorefrontOutlined sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>India's #1 Campus Marketplace</Typography>
          </Box>

          <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.15, mb: 2 }}>
            Buy &amp; Sell Within<br />
            <span style={{ background: 'linear-gradient(90deg,#A5F3FC,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Campus
            </span>
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.88, fontWeight: 400, maxWidth: 520, mx: 'auto', fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Fast, Safe &amp; Trusted — the smartest way for students to trade second-hand essentials.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" endIcon={<StorefrontOutlined />}
              sx={{
                backgroundColor: 'white', color: '#4F46E5', fontWeight: 800,
                px: 4, py: 1.5, borderRadius: 3, fontSize: '1rem', textTransform: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                '&:hover': { backgroundColor: '#EEF2FF', transform: 'translateY(-2px)', boxShadow: '0 12px 35px rgba(0,0,0,0.25)' },
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Shopping
            </Button>
            <Button variant="outlined" size="large" endIcon={<ArrowForward />}
              sx={{
                borderColor: 'white', color: 'white', fontWeight: 700,
                px: 4, py: 1.5, borderRadius: 3, fontSize: '1rem', textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'white' },
              }}
              onClick={() => navigate('/register')}>
              Join Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 7 }}>
        <Box id="categories-section" sx={{ textAlign: 'center', mb: 5 }}>
          <Chip label="Browse by Category" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>Shop by Categories</Typography>
        </Box>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {categories.map(cat => (
            <Grid size={{ xs: 3, sm: 3, md: 2 }} key={cat.name}>
              <Paper elevation={0} onClick={() => { setSelectedCategoryData(cat); setPopupOpen(true); }}
                sx={{
                  p: { xs: 1.5, md: 2 }, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                  border: '2px solid #E0E7FF', backgroundColor: 'white', transition: 'all 0.25s',
                  '&:hover': { borderColor: '#4F46E5', backgroundColor: '#EEF2FF', transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(79,70,229,0.15)' }
                }}>
                <Box component="img" src={cat.image} alt={cat.name}
                  onError={e => { e.target.src = `https://via.placeholder.com/100x100?text=${encodeURIComponent(cat.name)}`; }}
                  sx={{ width: { xs: 52, sm: 70, md: 88 }, height: { xs: 52, sm: 70, md: 88 }, objectFit: 'cover', borderRadius: 2, mb: 1 }}
                />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#374151', fontSize: { xs: '0.68rem', sm: '0.8rem' }, display: 'block' }}>
                  {cat.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <Box sx={{ backgroundColor: '#F5F3FF', py: 7 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Chip label="Hand-picked for you" sx={{ mb: 1.5, backgroundColor: '#EDE9FE', color: '#7C3AED', fontWeight: 700 }} />
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>Featured Products</Typography>
            </Box>
            <Grid container spacing={3}>
              {featuredProducts.slice(0, 4).map(p => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* All Products */}
      <Container maxWidth="lg" sx={{ py: 7 }} id="products-section">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip label="Fresh listings" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>All Products</Typography>
        </Box>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">Loading products...</Typography>
          </Box>
        ) : allProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No products found</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {allProducts.map(p => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Why Trust Us */}
      <Box sx={{ background: 'linear-gradient(180deg,#F9FAFB 0%,#EEF2FF 100%)', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Why BuyinGo?" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937', mb: 1 }}>Why Students Trust BuyinGo</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
              Thousands of students across campuses rely on BuyinGo every day.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {TRUST.map(t => (
              <Grid size={{ xs: 12, md: 4 }} key={t.title}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E0E7FF', backgroundColor: 'white', textAlign: 'center', transition: 'all 0.25s', '&:hover': { boxShadow: '0 12px 40px rgba(79,70,229,0.12)', transform: 'translateY(-4px)' } }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: 3, backgroundColor: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                    {t.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#1F2937' }}>{t.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{t.desc}</Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: `${t.color}18`, borderRadius: 99, px: 1.5, py: 0.4 }}>
                    <CheckCircleOutline sx={{ fontSize: 14, color: t.color }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: t.color }}>{t.check}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box sx={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', py: { xs: 7, md: 10 }, textAlign: 'center', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Ready to Buy or Sell?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.88, fontWeight: 400, maxWidth: 500, mx: 'auto' }}>
            Join thousands of students already saving money on BuyinGo.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/register')} endIcon={<ArrowForward />}
              sx={{
                backgroundColor: 'white', color: '#4F46E5', fontWeight: 800,
                px: 5, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                '&:hover': { backgroundColor: '#EEF2FF', transform: 'translateY(-2px)' },
                transition: 'all 0.2s',
              }}>
              Create Free Account
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white', color: 'white', fontWeight: 700,
                px: 5, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1rem',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'white' },
              }}>
              Sign In
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4, flexWrap: 'wrap' }}>
            {['100% Secure', 'Student Verified', 'Free to Join'].map(t => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, opacity: 0.9 }}>
                <CheckCircleOutline sx={{ fontSize: 16, color: '#A5F3FC' }} />
                <Typography variant="body2">{t}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Category Dialog */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <IconButton onClick={() => setPopupOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
          {selectedCategoryData && (
            <Box>
              <Box component="img" src={selectedCategoryData.image} alt={selectedCategoryData.name}
                sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 3, mx: 'auto', mb: 1.5, display: 'block', boxShadow: '0 4px 20px rgba(79,70,229,0.2)' }} />
              <Typography variant="h6" fontWeight={700}>{selectedCategoryData.name}</Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="body2" color="text.secondary">Browse all {selectedCategoryData?.name} products</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" size="large" endIcon={<ArrowForward />}
            sx={{ px: 5, borderRadius: 3, textTransform: 'none', fontWeight: 700, backgroundColor: '#4F46E5', color: 'white', boxShadow: 'none', '&:hover': { backgroundColor: '#4338CA' } }}
            onClick={() => { navigate(`/category/${encodeURIComponent(selectedCategoryData.name.toLowerCase())}`); setPopupOpen(false); }}>
            Browse {selectedCategoryData?.name}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2, fontWeight: 600 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
