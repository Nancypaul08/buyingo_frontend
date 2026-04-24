import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, Chip, Snackbar, Alert,
  CircularProgress, Divider, TextField, Dialog, DialogTitle,
  DialogContent, IconButton, Table, TableHead, TableBody,
  TableRow, TableCell, Tabs, Tab, useMediaQuery, useTheme,
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, LocalShipping, CheckCircle,
  NavigateNext, Close, StraightenOutlined, ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getImageUrl } from '../services/api';

const NO_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

const CONDITION_COLOR = {
  'New': '#10B981', 'Like New': '#3B82F6', 'Good': '#F59E0B', 'Fair': '#EF4444',
};

// Size chart data by category type
const SIZE_CHARTS = {
  clothing: {
    unit: ['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'Length (in)'],
    rows: [
      ['XS', '32–33', '26–27', '34–35', '25'],
      ['S',  '34–35', '28–29', '36–37', '25.5'],
      ['M',  '36–37', '30–31', '38–39', '26'],
      ['L',  '38–40', '32–34', '40–42', '26.5'],
      ['XL', '41–43', '35–37', '43–45', '27'],
      ['XXL','44–46', '38–40', '46–48', '27.5'],
    ],
  },
  shoes: {
    unit: ['UK Size', 'EU Size', 'US Size', 'Foot Length (cm)'],
    rows: [
      ['6',  '39', '7',   '24.5'],
      ['7',  '40', '8',   '25.5'],
      ['8',  '41', '9',   '26'],
      ['9',  '42', '10',  '26.5'],
      ['10', '43', '11',  '27.5'],
      ['11', '44', '12',  '28'],
    ],
  },
  general: {
    unit: ['Size', 'Dimensions (cm)', 'Fits'],
    rows: [
      ['Small',  '< 30 × 20', 'Compact use'],
      ['Medium', '30–50 × 20–35', 'Standard use'],
      ['Large',  '> 50 × 35', 'Heavy / bulk use'],
    ],
  },
};

const getCategoryType = (category = '') => {
  const c = category.toLowerCase();
  // Shoes only if explicitly shoe
  if (c.includes('shoe')) return 'shoes';
  // Clothing if it's apparel
  if (c.includes('suit') || c.includes('formal') || c.includes('shirt') ||
      c.includes('top') || c.includes('dress') || c.includes('kurti') ||
      c.includes('hanger') || c.includes('soft toy')) return 'clothing';
  return 'general';
};

// Size Chart Modal
const SizeChartModal = ({ open, onClose, category, sizes }) => {
  const [tab, setTab] = useState(0);
  const type = getCategoryType(category);
  const chart = SIZE_CHARTS[type];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #F3F4F6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StraightenOutlined sx={{ color: '#4F46E5' }} />
          <Typography fontWeight={800} fontSize="1.1rem">Size Chart</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs: Size Chart / How to Measure */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #F3F4F6', px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' } }}>
          <Tab label="Size Chart" />
          <Tab label="How to Measure" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            {/* Available sizes highlight */}
            {sizes?.length > 0 && (
              <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#EEF2FF', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="#4F46E5">
                  Available sizes for this product: {sizes.join(', ')}
                </Typography>
              </Box>
            )}

            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 360 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    {chart.unit.map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#374151', whiteSpace: 'nowrap', py: 1.2 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chart.rows.map((row, i) => {
                    const isAvailable = sizes?.includes(row[0]);
                    return (
                      <TableRow key={i} sx={{
                        backgroundColor: isAvailable ? '#EEF2FF' : 'white',
                        '&:hover': { backgroundColor: isAvailable ? '#E0E7FF' : '#F9FAFB' },
                      }}>
                        {row.map((cell, j) => (
                          <TableCell key={j} sx={{
                            fontSize: '0.82rem', py: 1.2,
                            fontWeight: j === 0 ? 800 : 500,
                            color: j === 0 && isAvailable ? '#4F46E5' : '#374151',
                          }}>
                            {cell}
                            {j === 0 && isAvailable && (
                              <Chip label="In stock" size="small"
                                sx={{ ml: 0.8, height: 16, fontSize: '0.6rem', backgroundColor: '#4F46E5', color: 'white', fontWeight: 700 }} />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, px: 0.5 }}>
              * All measurements are approximate. Sizes may vary slightly by product.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom>How to Take Your Measurements</Typography>
            {[
              { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
              { label: 'Waist', desc: 'Measure around your natural waistline, the narrowest part of your torso.' },
              { label: 'Hip', desc: 'Measure around the fullest part of your hips, about 8 inches below your waist.' },
              { label: 'Length', desc: 'Measure from the highest point of your shoulder down to where you want the garment to end.' },
              { label: 'Foot Length', desc: 'Stand on a flat surface and measure from the back of your heel to the tip of your longest toe.' },
            ].map(m => (
              <Box key={m.label} sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4F46E5', mt: 0.7, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>{m.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.desc}</Typography>
                </Box>
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#FFF7ED', borderRadius: 2, border: '1px solid #FED7AA' }}>
              <Typography variant="caption" fontWeight={700} color="#C2410C">
                💡 Tip: If you're between sizes, we recommend sizing up for a more comfortable fit.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showToast = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        if (r.data.sizes?.length) setSelectedSize(r.data.sizes[0]);
        if (r.data.colors?.length) setSelectedColor(r.data.colors[0]);
      })
      .catch(() => showToast('Product not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (product.sizes?.length && !selectedSize) { showToast('Please select a size', 'warning'); return; }
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`${product.name} added to cart!`);
    } catch { showToast('Failed to add to cart', 'error'); }
  };

  const checkPincode = () => {
    if (pincode.length !== 6) { setPincodeMsg('Enter a valid 6-digit pincode'); return; }
    setPincodeMsg('Delivery available in 3–5 days');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>;
  if (!product) return <Box sx={{ textAlign: 'center', py: 10 }}><Typography color="text.secondary">Product not found</Typography><Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Go Home</Button></Box>;

  const allImages = [product.image_url, ...(product.extra_images || [])].filter(Boolean);
  if (allImages.length === 0) allImages.push(null);

  const prevImg = () => setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg(i => (i + 1) % allImages.length);

  const handleWishlist = () => {
    setWishlisted(w => !w);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', wishlisted ? 'info' : 'success');
  };

  return (
    <Box sx={{ backgroundColor: 'white', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          {[
            { label: 'Home', to: '/' },
            { label: product.category, to: `/category/${encodeURIComponent(product.category.toLowerCase())}` },
            { label: product.name },
          ].map((b, i, arr) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
              {b.to
                ? <Typography component={Link} to={b.to} variant="caption" sx={{ color: '#6B7280', textDecoration: 'none', '&:hover': { color: '#4F46E5' } }}>{b.label}</Typography>
                : <Typography variant="caption" fontWeight={700} sx={{ color: '#1F2937' }}>{b.label}</Typography>
              }
              {i < arr.length - 1 && <NavigateNext sx={{ fontSize: 14, color: '#9CA3AF', mx: 0.3 }} />}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, px: { xs: 0, md: 4, lg: 6 } }}>

        {/* LEFT: Myntra-style image viewer */}
        <Box sx={{ width: { xs: '100%', md: '55%', lg: '58%' }, flexShrink: 0 }}>
          {isMobile ? (
            /* Mobile: full-width swipeable single image with dots */
            <Box sx={{ position: 'relative', backgroundColor: '#F9FAFB' }}>
              <Box sx={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                <Box component="img"
                  src={allImages[activeImg] ? (getImageUrl(allImages[activeImg]) || NO_IMG) : NO_IMG}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                />
                {/* Wishlist button on image */}
                <IconButton onClick={handleWishlist} sx={{
                  position: 'absolute', top: 12, right: 12,
                  backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { backgroundColor: '#FFF0F0' },
                }}>
                  {wishlisted
                    ? <Favorite sx={{ color: '#EF4444', fontSize: 22 }} />
                    : <FavoriteBorder sx={{ color: '#6B7280', fontSize: 22 }} />}
                </IconButton>
                {/* Prev/Next arrows */}
                {allImages.length > 1 && <>
                  <IconButton onClick={prevImg} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.85)', p: 0.5 }}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={nextImg} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.85)', p: 0.5 }}>
                    <ChevronRight />
                  </IconButton>
                </>}
              </Box>
              {/* Dots */}
              {allImages.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8, py: 1.2 }}>
                  {allImages.map((_, i) => (
                    <Box key={i} onClick={() => setActiveImg(i)} sx={{
                      width: activeImg === i ? 20 : 7, height: 7, borderRadius: 99,
                      backgroundColor: activeImg === i ? '#4F46E5' : '#D1D5DB',
                      cursor: 'pointer', transition: 'all 0.25s',
                    }} />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            /* Desktop: thumbnail strip on left + large image */
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {/* Thumbnail strip */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 72, flexShrink: 0 }}>
                {allImages.map((img, i) => (
                  <Box key={i} onClick={() => setActiveImg(i)} sx={{
                    width: 72, height: 90, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    border: activeImg === i ? '2px solid #1F2937' : '2px solid transparent',
                    backgroundColor: '#F9FAFB',
                  }}>
                    <Box component="img"
                      src={img ? (getImageUrl(img) || NO_IMG) : NO_IMG}
                      alt={`thumb ${i + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                    />
                  </Box>
                ))}
              </Box>
              {/* Large image */}
              <Box sx={{ flex: 1, position: 'relative', backgroundColor: '#F9FAFB', aspectRatio: '3/4', overflow: 'hidden' }}>
                <Box component="img"
                  src={allImages[activeImg] ? (getImageUrl(allImages[activeImg]) || NO_IMG) : NO_IMG}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'opacity 0.2s' }}
                />
                {/* Wishlist on image */}
                <IconButton onClick={handleWishlist} sx={{
                  position: 'absolute', top: 12, right: 12,
                  backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { backgroundColor: '#FFF0F0' },
                }}>
                  {wishlisted
                    ? <Favorite sx={{ color: '#EF4444', fontSize: 22 }} />
                    : <FavoriteBorder sx={{ color: '#6B7280', fontSize: 22 }} />}
                </IconButton>
                {allImages.length > 1 && <>
                  <IconButton onClick={prevImg} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.85)', p: 0.5 }}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={nextImg} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.85)', p: 0.5 }}>
                    <ChevronRight />
                  </IconButton>
                </>
                }
              </Box>
            </Box>
          )}
        </Box>

        {/* RIGHT: Sticky details */}
        <Box sx={{
          flex: 1, position: { md: 'sticky' }, top: { md: 70 }, alignSelf: { md: 'flex-start' },
          px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 },
          maxHeight: { md: 'calc(100vh - 70px)' }, overflowY: { md: 'auto' },
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>

          {product.brand && <Typography variant="h5" fontWeight={900} sx={{ color: '#1F2937', mb: 0.3, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>{product.brand}</Typography>}
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 1.5 }}>{product.name}</Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}>
            <Typography fontWeight={900} sx={{ fontSize: { xs: '1.6rem', md: '1.8rem' }, color: '#1F2937' }}>₹{product.price}</Typography>
            {product.condition === 'New' && <>
              <Typography sx={{ color: '#6B7280', textDecoration: 'line-through', fontSize: '1rem' }}>₹{Math.round(product.price * 1.3)}</Typography>
              <Typography fontWeight={700} sx={{ color: '#4F46E5', fontSize: '1rem' }}>(23% OFF)</Typography>
            </>}
          </Box>
          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, display: 'block', mb: 2 }}>inclusive of all taxes</Typography>

          {/* Chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
            {product.condition && <Chip label={product.condition} size="small" sx={{ backgroundColor: `${CONDITION_COLOR[product.condition]}15`, color: CONDITION_COLOR[product.condition], fontWeight: 700 }} />}
            <Chip label={product.category} size="small" sx={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
          </Box>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" fontWeight={800} sx={{ mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.8rem' }}>More Colors</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.colors.map(color => (
                  <Box key={color} onClick={() => setSelectedColor(color)} sx={{
                    px: 2, py: 0.7, borderRadius: 1, cursor: 'pointer',
                    border: selectedColor === color ? '2px solid #1F2937' : '1px solid #D1D5DB',
                    backgroundColor: selectedColor === color ? '#F9FAFB' : 'white',
                    fontSize: '0.82rem', fontWeight: selectedColor === color ? 700 : 500,
                    transition: 'all 0.15s', '&:hover': { borderColor: '#1F2937' },
                  }}>{color}</Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="body2" fontWeight={800} sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.8rem' }}>Select Size</Typography>
                <Button size="small" startIcon={<StraightenOutlined sx={{ fontSize: 14 }} />}
                  onClick={() => setSizeChartOpen(true)}
                  sx={{ color: '#4F46E5', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', p: 0, minWidth: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}>
                  SIZE CHART →
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.sizes.map(size => (
                  <Box key={size} onClick={() => setSelectedSize(size)} sx={{
                    width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: selectedSize === size ? '2px solid #1F2937' : '1px solid #D1D5DB',
                    backgroundColor: selectedSize === size ? '#1F2937' : 'white',
                    color: selectedSize === size ? 'white' : '#1F2937',
                    fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.15s',
                    '&:hover': { borderColor: '#1F2937' },
                  }}>{size}</Box>
                ))}
              </Box>
            </Box>
          )}

          {/* CTA */}
          {!product.is_sold ? (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button variant="contained" fullWidth size="large" startIcon={<ShoppingCart />} onClick={handleAddToCart}
                sx={{ borderRadius: 2, py: 1.6, fontWeight: 800, textTransform: 'none', fontSize: '1rem', backgroundColor: '#4F46E5', '&:hover': { backgroundColor: '#4338CA' }, boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}>
                Add to Cart
              </Button>
              <Button variant="outlined" fullWidth size="large"
                startIcon={wishlisted ? <Favorite sx={{ color: '#EF4444' }} /> : <FavoriteBorder />}
                onClick={handleWishlist}
                sx={{ borderRadius: 2, py: 1.6, fontWeight: 800, textTransform: 'none', fontSize: '1rem', borderColor: wishlisted ? '#EF4444' : '#4F46E5', color: wishlisted ? '#EF4444' : '#4F46E5', '&:hover': { borderColor: wishlisted ? '#DC2626' : '#4338CA', backgroundColor: wishlisted ? '#FFF0F0' : '#EEF2FF' } }}>
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 2, backgroundColor: '#FEF2F2', borderRadius: 1, mb: 3, textAlign: 'center' }}>
              <Typography color="error" fontWeight={700} textTransform="uppercase">Sold Out</Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2.5 }} />

          {/* Delivery */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalShipping sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem' }}>Delivery Options</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" placeholder="Enter pincode" value={pincode}
                onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeMsg(''); }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.875rem' } }} />
              <Button onClick={checkPincode} sx={{ color: '#4F46E5', fontWeight: 700, textTransform: 'none', px: 2, '&:hover': { backgroundColor: '#EEF2FF' } }}>Check</Button>
            </Box>
            {pincodeMsg && <Typography variant="caption" sx={{ color: pincodeMsg.includes('available') ? '#10B981' : '#EF4444', fontWeight: 600 }}>{pincodeMsg}</Typography>}
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {['100% Original Products', 'Pay on delivery might be available', 'Easy 3 days returns and exchanges'].map(t => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 14, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ color: '#374151' }}>{t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Description */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', mb: 1.5 }}>Product Description</Typography>
            {product.description.split('\n').map((line, i) => (
              line.trim() === ''
                ? <Box key={i} sx={{ height: 8 }} />
                : <Typography key={i} variant="body2" sx={{ color: '#4B5563', lineHeight: 1.9 }}>{line}</Typography>
            ))}
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Details table */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', mb: 1.5 }}>Product Details</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {[
                { label: 'Category', value: product.category },
                product.brand && { label: 'Brand', value: product.brand },
                product.condition && { label: 'Condition', value: product.condition },
                product.sizes?.length && { label: 'Available Sizes', value: product.sizes.join(', ') },
                product.colors?.length && { label: 'Available Colors', value: product.colors.join(', ') },
                { label: 'Listed On', value: new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].filter(Boolean).map(row => (
                <Box key={row.label} sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', width: 130, flexShrink: 0 }}>{row.label}</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#1F2937' }}>{row.value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Seller */}
          <Box>
            <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', mb: 1.5 }}>Seller Information</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography fontWeight={800} sx={{ color: '#4F46E5' }}>{product.seller?.full_name?.[0]?.toUpperCase() || 'S'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>{product.seller?.full_name || 'N/A'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 13, color: '#10B981' }} />
                  <Typography variant="caption" color="text.secondary">Verified Student Seller</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Size Chart Modal */}
      <SizeChartModal
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        category={product.category}
        sizes={product.sizes}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;
