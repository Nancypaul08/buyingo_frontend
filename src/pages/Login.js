import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Link, CircularProgress, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, severity = 'error') => setToast({ open: true, message, severity });

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) { showToast('Welcome back! 🎉', 'success'); setTimeout(() => navigate('/'), 800); }
    else showToast(result.error);
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF4FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BuyinGo
          </Typography>
          <Typography variant="body2" color="text.secondary">Campus Marketplace</Typography>
        </Box>

        {/* Card */}
        <Box sx={{ backgroundColor: 'white', borderRadius: 4, p: { xs: 3, sm: 4 }, boxShadow: '0 20px 60px rgba(79,70,229,0.12)' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back 👋</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Sign in to your account to continue</Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email}
              onChange={handleChange} error={!!errors.email} helperText={errors.email}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8B5CF6', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#8B5CF6', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(s => !s)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 2.5 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
              py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
              background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
              '&:hover': { background: 'linear-gradient(135deg,#4338CA,#7C3AED)', boxShadow: '0 6px 25px rgba(79,70,229,0.45)' }
            }}>
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #F3F4F6' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Create one free →
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ width: '100%', borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
