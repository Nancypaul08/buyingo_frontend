import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  FormControl, InputLabel, Select, MenuItem, Chip,
  CircularProgress, Snackbar, Alert, Divider, IconButton,
} from '@mui/material';
import { Add, Close, CloudUpload, AddPhotoAlternate } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = [
  'Air Cooler', 'Water Bottles', 'Coffee Mugs', 'Buckets',
  'Pillows', 'LED Lights', 'Routers', 'Mattresses',
  'Formal Suits', 'Formal Shoes', 'Hangers', 'Soft Toys',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const PRESET_SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['6', '7', '8', '9', '10', '11'],
  general: ['Small', 'Medium', 'Large'],
};

const PRESET_COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey'];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    brand: '', condition: 'Good',
  });
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]); // [{file, preview}]
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');

  const showToast = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMainImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleExtraImages = e => {
    const files = Array.from(e.target.files).slice(0, 4 - extraImages.length);
    const newImgs = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setExtraImages(prev => [...prev, ...newImgs].slice(0, 4));
  };

  const removeExtraImage = i => setExtraImages(prev => prev.filter((_, idx) => idx !== i));

  const toggleSize = s => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleColor = c => setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const addCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes(prev => [...prev, customSize.trim()]);
      setCustomSize('');
    }
  };

  const addCustomColor = () => {
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors(prev => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      showToast('Please fill all required fields', 'error'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (mainImage) fd.append('image', mainImage);
      if (sizes.length) fd.append('sizes', sizes.join(','));
      if (colors.length) fd.append('colors', colors.join(','));

      const res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const productId = res.data.id;

      // Upload extra images one by one
      for (const img of extraImages) {
        const imgFd = new FormData();
        imgFd.append('image', img.file);
        imgFd.append('product_id', productId);
        try { await api.post(`/products/${productId}/images`, imgFd, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch {}
      }

      showToast('Product added successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      showToast(err.response?.data?.error || 'Error adding product', 'error');
    } finally { setLoading(false); }
  };

  const sectionTitle = (title) => (
    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5, color: '#1F2937' }}>{title}</Typography>
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
      <Paper elevation={0} sx={{ border: '1px solid #E0E7FF', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', p: 3, color: 'white' }}>
          <Typography variant="h5" fontWeight={900}>Add New Product</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Fill in the details to list your product</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>

          {/* ── Basic Info ── */}
          {sectionTitle('Basic Information')}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField required fullWidth label="Product Name" name="name" value={form.name} onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField required fullWidth label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange}
                inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField fullWidth label="Brand (optional)" name="brand" value={form.brand} onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={form.category} label="Category" onChange={handleChange}>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Condition</InputLabel>
                <Select name="condition" value={form.condition} label="Condition" onChange={handleChange}>
                  {CONDITIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField required fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the product — age, usage, any defects, reason for selling..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ── Images ── */}
          {sectionTitle('Product Images')}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {/* Main image */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>Main Image *</Typography>
              <label htmlFor="main-img">
                <Box sx={{
                  width: 120, height: 120, borderRadius: 2, border: '2px dashed #C7D2FE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', backgroundColor: '#F9FAFB',
                  '&:hover': { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
                  transition: 'all 0.2s',
                }}>
                  {mainPreview
                    ? <Box component="img" src={mainPreview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Box sx={{ textAlign: 'center' }}><CloudUpload sx={{ color: '#9CA3AF', fontSize: 28 }} /><Typography variant="caption" color="text.secondary" display="block">Upload</Typography></Box>
                  }
                </Box>
              </label>
              <input id="main-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainImage} />
            </Box>

            {/* Extra images */}
            {extraImages.map((img, i) => (
              <Box key={i} sx={{ position: 'relative' }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>Image {i + 2}</Typography>
                <Box sx={{ width: 120, height: 120, borderRadius: 2, overflow: 'hidden', border: '2px solid #E0E7FF' }}>
                  <Box component="img" src={img.preview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <IconButton size="small" onClick={() => removeExtraImage(i)}
                  sx={{ position: 'absolute', top: 20, right: -8, backgroundColor: '#EF4444', color: 'white', width: 20, height: 20, '&:hover': { backgroundColor: '#DC2626' } }}>
                  <Close sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}

            {/* Add more */}
            {extraImages.length < 4 && (
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>Add More</Typography>
                <label htmlFor="extra-imgs">
                  <Box sx={{
                    width: 120, height: 120, borderRadius: 2, border: '2px dashed #C7D2FE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', backgroundColor: '#F9FAFB',
                    '&:hover': { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
                    transition: 'all 0.2s',
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AddPhotoAlternate sx={{ color: '#9CA3AF', fontSize: 28 }} />
                      <Typography variant="caption" color="text.secondary" display="block">+{4 - extraImages.length} more</Typography>
                    </Box>
                  </Box>
                </label>
                <input id="extra-imgs" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleExtraImages} />
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ── Sizes ── */}
          {sectionTitle('Sizes (optional)')}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              {[...PRESET_SIZES.clothing, ...PRESET_SIZES.shoes, ...PRESET_SIZES.general].map(s => (
                <Chip key={s} label={s} onClick={() => toggleSize(s)} clickable
                  variant={sizes.includes(s) ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, ...(sizes.includes(s) ? { backgroundColor: '#4F46E5', color: 'white' } : { borderColor: '#C7D2FE', color: '#374151' }) }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Custom size (e.g. 42, 2XL)" value={customSize}
                onChange={e => setCustomSize(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Button variant="outlined" onClick={addCustomSize} startIcon={<Add />}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#4F46E5', color: '#4F46E5' }}>Add</Button>
            </Box>
            {sizes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>Selected:</Typography>
                {sizes.map(s => (
                  <Chip key={s} label={s} size="small" onDelete={() => toggleSize(s)}
                    sx={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ── Colors ── */}
          {sectionTitle('Colors (optional)')}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              {PRESET_COLORS.map(c => (
                <Chip key={c} label={c} onClick={() => toggleColor(c)} clickable
                  variant={colors.includes(c) ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, ...(colors.includes(c) ? { backgroundColor: '#4F46E5', color: 'white' } : { borderColor: '#C7D2FE', color: '#374151' }) }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Custom color" value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Button variant="outlined" onClick={addCustomColor} startIcon={<Add />}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#4F46E5', color: '#4F46E5' }}>Add</Button>
            </Box>
            {colors.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>Selected:</Typography>
                {colors.map(c => (
                  <Chip key={c} label={c} size="small" onDelete={() => toggleColor(c)}
                    sx={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Submit */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 800, textTransform: 'none', fontSize: '1rem', backgroundColor: '#4F46E5', '&:hover': { backgroundColor: '#4338CA' }, boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}>
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'List Product'}
            </Button>
            <Button variant="outlined" fullWidth size="large" onClick={() => navigate('/admin')}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: 'none', borderColor: '#E0E7FF', color: '#374151' }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddProduct;
