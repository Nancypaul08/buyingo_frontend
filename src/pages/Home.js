import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Card, CardContent, CardMedia,
  Button, Box, Chip, Paper, IconButton, Snackbar, Alert,
  CircularProgress, Grid,
} from '@mui/material';
import {
  ShoppingCart, StorefrontOutlined, ArrowForward,
  Star, CheckCircleOutline, ChevronLeft, ChevronRight,
  VerifiedUser as VerifiedUserIcon, Security as SecurityIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

const NO_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUVGMkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOEI1Q0Y2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

// Banner slides — rich gradient designs with icons
const BANNERS = [
  {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#4F46E5',
    tag: 'Summer Deal',
    title: 'Air Coolers',
    sub: 'Beat the heat this summer',
    price: 'From ₹499',
    emoji: '❄️',
    category: 'Air Cooler',
    cta: 'Shop Now',
    pattern: 'radial-gradient(circle at 80% 50%, rgba(79,70,229,0.3) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    accent: '#10B981',
    tag: 'Best Seller',
    title: 'Mattresses',
    sub: 'Sleep better every night',
    price: 'From ₹799',
    emoji: '🛏️',
    category: 'Mattresses',
    cta: 'Explore',
    pattern: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.25) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #11998e 100%)',
    accent: '#F59E0B',
    tag: 'New Arrival',
    title: 'LED Lights',
    sub: 'Brighten up your room',
    price: 'From ₹99',
    emoji: '💡',
    category: 'LED Lights',
    cta: 'Buy Now',
    pattern: 'radial-gradient(circle at 80% 50%, rgba(245,158,11,0.25) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    accent: '#EC4899',
    tag: 'Top Pick',
    title: 'Routers & WiFi',
    sub: 'Stay connected always',
    price: 'From ₹299',
    emoji: '📡',
    category: 'Routers',
    cta: 'View All',
    pattern: 'radial-gradient(circle at 80% 50%, rgba(236,72,153,0.25) 0%, transparent 60%)',
  },
];

const CATEGORIES = [
  { name: 'All', image: null },
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
];

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const bannerTimer = useRef(null);

  // Auto-slide banner every 4s
  useEffect(() => {
    bannerTimer.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(bannerTimer.current);
  }, []);

  useEffect(() => {
    api.get('/products').then(r => setAllProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/products/featured').then(r => setFeaturedProducts(r.data)).catch(() => {});
  }, []);

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

  const goToBanner = (i) => {
    clearInterval(bannerTimer.current);
    setBannerIdx(i);
    bannerTimer.current = setInterval(() => setBannerIdx(j => (j + 1) % BANNERS.length), 4000);
  };

  const filteredProducts = activeCategory === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  const ProductCard = ({ product, index }) => (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 2, border: '1px solid #E0E7FF', backgroundColor: 'white',
      boxShadow: '0 1px 8px rgba(79,70,229,0.06)',
      transition: 'all 0.22s ease',
      animation: `fadeUp 0.35s ease ${Math.min(index, 8) * 0.05}s both`,
      '@keyframes fadeUp': {
        from: { opacity: 0, transform: 'translateY(16px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(79,70,229,0.14)', borderColor: '#A5B4FC' },
    }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia component="img"
          image={getImageUrl(product.image_url) || NO_IMG} alt={product.name}
          sx={{
            height: { xs: 220, sm: 200, md: 210 }, objectFit: 'cover', objectPosition: 'center top', cursor: 'pointer',
            transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' },
          }}
          onClick={() => navigate(`/product/${product.id}`)}
        />
        {product.is_featured && (
          <Box sx={{
            position: 'absolute', top: 8, left: 8,
            background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
            borderRadius: 99, px: 1, py: 0.2,
            display: 'flex', alignItems: 'center', gap: 0.3,
          }}>
            <Star sx={{ fontSize: 10, color: 'white' }} />
            <Typography sx={{ fontSize: '0.62rem', color: 'white', fontWeight: 700 }}>Featured</Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.2, md: 1.5 }, '&:last-child': { pb: { xs: 1.2, md: 1.5 } } }}>
        <Typography variant="body2" fontWeight={700} noWrap
          sx={{ cursor: 'pointer', mb: 0.3, fontSize: { xs: '0.8rem', md: '0.875rem' }, '&:hover': { color: '#4F46E5' } }}
          onClick={() => navigate(`/product/${product.id}`)}>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ mb: 1, display: 'block' }}>
          {product.category}
        </Typography>
        <Typography fontWeight={800} sx={{ color: '#4F46E5', fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 1 }}>
          ₹{product.price}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8, mt: 'auto' }}>
          <Button variant="contained" size="small" fullWidth
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, py: 0.6, fontSize: '0.75rem', backgroundColor: '#4F46E5', boxShadow: 'none', '&:hover': { backgroundColor: '#4338CA' } }}
            onClick={() => navigate(`/product/${product.id}`)}>
            Buy Now
          </Button>
          <IconButton size="small" onClick={() => handleAddToCart(product)}
            sx={{ border: '1px solid #E0E7FF', borderRadius: 1.5, color: '#4F46E5', flexShrink: 0, '&:hover': { backgroundColor: '#EEF2FF' } }}>
            <ShoppingCart sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#F9FAFB' }}>

      {/* ── Horizontal Category Bar ── */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #EEF2FF', position: 'sticky', top: { xs: 56, md: 64 }, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, maxWidth: 1200, mx: 'auto' }}>
          {CATEGORIES.map(cat => (
            <Box key={cat.name} onClick={() => { setActiveCategory(cat.name); if (cat.name !== 'All') document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                px: { xs: 1.8, md: 2.5 }, py: { xs: 1, md: 1.5 }, cursor: 'pointer', flexShrink: 0,
                borderBottom: activeCategory === cat.name ? '3px solid #4F46E5' : '3px solid transparent',
                transition: 'all 0.18s',
                '&:hover': { backgroundColor: '#F9FAFB' },
              }}>
              {cat.image ? (
                <Box component="img" src={cat.image} alt={cat.name}
                  sx={{ width: { xs: 26, md: 34 }, height: { xs: 26, md: 34 }, objectFit: 'cover', borderRadius: 1 }}
                />
              ) : (
                <StorefrontOutlined sx={{ fontSize: { xs: 24, md: 30 }, color: activeCategory === cat.name ? '#4F46E5' : '#6B7280' }} />
              )}
              <Typography variant="caption" fontWeight={activeCategory === cat.name ? 700 : 500}
                sx={{ color: activeCategory === cat.name ? '#4F46E5' : '#6B7280', fontSize: { xs: '0.62rem', md: '0.72rem' }, whiteSpace: 'nowrap' }}>
                {cat.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Image Banner Slider ── */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 200, sm: 280, md: 380 }, backgroundColor: '#1F2937' }}>
        {BANNERS.map((b, i) => (
          <Box key={i} sx={{
            position: 'absolute', inset: 0,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            opacity: bannerIdx === i ? 1 : 0,
            transform: bannerIdx === i ? 'scale(1)' : 'scale(1.03)',
            pointerEvents: bannerIdx === i ? 'auto' : 'none',
            background: b.bg,
          }}>
            {/* Pattern overlay */}
            <Box sx={{ position: 'absolute', inset: 0, background: b.pattern }} />

            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', right: -40, top: -40, width: { xs: 180, md: 280 }, height: { xs: 180, md: 280 }, borderRadius: '50%', border: `2px solid ${b.accent}30` }} />
            <Box sx={{ position: 'absolute', right: 20, top: 20, width: { xs: 120, md: 200 }, height: { xs: 120, md: 200 }, borderRadius: '50%', border: `2px solid ${b.accent}20` }} />

            {/* Big emoji on right */}
            <Box sx={{
              position: 'absolute', right: { xs: 16, md: 80 }, top: '50%', transform: 'translateY(-50%)',
              fontSize: { xs: '5rem', md: '9rem' }, lineHeight: 1,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
              userSelect: 'none',
            }}>
              {b.emoji}
            </Box>

            {/* Text content */}
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', pl: { xs: 3, md: 7 } }}>
              <Box sx={{ maxWidth: { xs: '65%', md: '55%' } }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: b.accent, borderRadius: 99, px: 1.5, py: 0.4, mb: { xs: 1.5, md: 2 } }}>
                  <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' }, color: 'white', fontWeight: 800, letterSpacing: 0.5 }}>
                    {b.tag.toUpperCase()}
                  </Typography>
                </Box>
                <Typography fontWeight={900} sx={{
                  color: 'white', lineHeight: 1.1, mb: { xs: 0.8, md: 1.2 },
                  fontSize: { xs: '1.6rem', sm: '2.2rem', md: '3rem' },
                  textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}>
                  {b.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: { xs: 0.5, md: 0.8 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>
                  {b.sub}
                </Typography>
                <Typography fontWeight={800} sx={{ color: b.accent, fontSize: { xs: '1rem', md: '1.3rem' }, mb: { xs: 1.5, md: 2.5 } }}>
                  {b.price}
                </Typography>
                <Button variant="contained" size="small"
                  sx={{ backgroundColor: b.accent, color: 'white', fontWeight: 800, borderRadius: 2, px: { xs: 2.5, md: 4 }, py: { xs: 0.8, md: 1.2 }, textTransform: 'none', fontSize: { xs: '0.8rem', md: '0.95rem' }, boxShadow: `0 4px 20px ${b.accent}60`, '&:hover': { filter: 'brightness(1.15)' } }}
                  onClick={() => { setActiveCategory(b.category); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {b.cta} →
                </Button>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Arrows */}
        <IconButton onClick={() => goToBanner((bannerIdx - 1 + BANNERS.length) % BANNERS.length)}
          sx={{ position: 'absolute', left: { xs: 6, md: 12 }, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.55)' }, p: { xs: 0.5, md: 1 } }}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={() => goToBanner((bannerIdx + 1) % BANNERS.length)}
          sx={{ position: 'absolute', right: { xs: 6, md: 12 }, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.55)' }, p: { xs: 0.5, md: 1 } }}>
          <ChevronRight />
        </IconButton>

        {/* Dots */}
        <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.8 }}>
          {BANNERS.map((_, i) => (
            <Box key={i} onClick={() => goToBanner(i)} sx={{
              width: bannerIdx === i ? 22 : 8, height: 8, borderRadius: 99,
              backgroundColor: 'white', opacity: bannerIdx === i ? 1 : 0.5,
              cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 1.5, md: 3 } }}>

        {/* ── Featured Products horizontal scroll ── */}
        {featuredProducts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Hand-picked" size="small" sx={{ backgroundColor: '#EDE9FE', color: '#7C3AED', fontWeight: 700 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#1F2937', fontSize: { xs: '1rem', md: '1.15rem' } }}>Featured Products</Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', color: '#4F46E5', fontWeight: 600, fontSize: '0.8rem' }}
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                See all
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, scrollSnapType: 'x mandatory' }}>
              {featuredProducts.map((p, i) => (
                <Box key={p.id} sx={{ minWidth: { xs: 155, sm: 190, md: 210 }, maxWidth: { xs: 155, sm: 190, md: 210 }, flexShrink: 0, scrollSnapAlign: 'start' }}>
                  <ProductCard product={p} index={i} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── All / Filtered Products Grid ── */}
        <Box id="products-section">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#1F2937', fontSize: { xs: '1rem', md: '1.15rem' } }}>
                {activeCategory === 'All' ? 'All Products' : activeCategory}
              </Typography>
              {activeCategory !== 'All' && (
                <Button size="small" onClick={() => setActiveCategory('All')}
                  sx={{ textTransform: 'none', color: '#6B7280', fontSize: '0.72rem', minWidth: 0, p: 0.5 }}>
                  ✕ Clear
                </Button>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">{filteredProducts.length} items</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">No products found</Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {filteredProducts.map((p, i) => (
                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }} key={p.id}>
                  <ProductCard product={p} index={i} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* ── Trust Strip ── */}
        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mt: 5, flexDirection: { xs: 'column', sm: 'row' } }}>
          {[
            { icon: <VerifiedUserIcon sx={{ fontSize: 24, color: 'white' }} />, title: '100% Verified', desc: 'Only verified students', color: '#10B981' },
            { icon: <SecurityIcon sx={{ fontSize: 24, color: 'white' }} />, title: 'Secure Payments', desc: 'Safe transactions', color: '#4F46E5' },
            { icon: <LocalOfferIcon sx={{ fontSize: 24, color: 'white' }} />, title: 'Best Prices', desc: 'Unbeatable deals', color: '#8B5CF6' },
          ].map(t => (
            <Paper key={t.title} elevation={0} sx={{ flex: 1, p: { xs: 1.5, md: 2 }, borderRadius: 2.5, border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', gap: 1.5, backgroundColor: 'white' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.icon}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>{t.title}</Typography>
                <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ── CTA ── */}
      <Box sx={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', py: { xs: 5, md: 7 }, textAlign: 'center', color: 'white' }}>
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
            Ready to Buy or Sell?
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.88, fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Join thousands of students already saving money on BuyinGo.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/register')} endIcon={<ArrowForward />}
              sx={{ backgroundColor: 'white', color: '#4F46E5', fontWeight: 800, px: 3.5, py: 1.2, borderRadius: 2.5, textTransform: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#EEF2FF' } }}>
              Create Free Account
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')}
              sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 3.5, py: 1.2, borderRadius: 2.5, textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              Sign In
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2.5, flexWrap: 'wrap' }}>
            {['100% Secure', 'Student Verified', 'Free to Join'].map(t => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.88 }}>
                <CheckCircleOutline sx={{ fontSize: 14, color: '#A5F3FC' }} />
                <Typography variant="caption">{t}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
