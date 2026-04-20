import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Link, CircularProgress, Snackbar, Alert, InputAdornment, IconButton, Stepper, Step, StepLabel } from '@mui/material';
import { Person, Email, Phone, Lock, Visibility, VisibilityOff, MarkEmailRead } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Your Details', 'Verify Email'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ full_name: '', email: '', contact_number: '', password: '', confirm_password: '' });
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, severity = 'error') => setToast({ open: true, message, severity });

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.contact_number.trim()) errs.contact_number = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.contact_number.trim())) errs.contact_number = 'Enter a valid 10-digit number';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(formData);
    if (result.success) { showToast('Account created! Check your email for OTP 📧', 'success'); setActiveStep(1); }
    else showToast(result.error);
    setLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setOtpError('OTP is required'); return; }
    if (!/^\d{6}$/.test(otp.trim())) { setOtpError('Enter a valid 6-digit OTP'); return; }
    setOtpError('');
    setLoading(true);
    const result = await verifyEmail(formData.email, otp);
    if (result.success) { showToast('Email verified! Redirecting... 🎉', 'success'); setTimeout(() => navigate('/login'), 2000); }
    else showToast(result.error);
    setLoading(false);
  };

  const fieldSx = { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } };
  const iconSx = { color: '#8B5CF6', fontSize: 20 };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF4FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BuyinGo
          </Typography>
          <Typography variant="body2" color="text.secondary">Campus Marketplace</Typography>
        </Box>

        <Box sx={{ backgroundColor: 'white', borderRadius: 4, p: { xs: 3, sm: 4 }, boxShadow: '0 20px 60px rgba(79,70,229,0.12)' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {activeStep === 0 ? 'Create your account 🚀' : 'Verify your email 📬'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {activeStep === 0 ? 'Join thousands of students on BuyinGo' : `We sent a 6-digit code to ${formData.email}`}
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {activeStep === 0 && (
            <Box component="form" onSubmit={handleRegistration}>
              <TextField fullWidth label="Full Name" name="full_name" value={formData.full_name}
                onChange={handleChange} error={!!errors.full_name} helperText={errors.full_name} sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={iconSx} /></InputAdornment> }}
              />
              <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email}
                onChange={handleChange} error={!!errors.email} helperText={errors.email} sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={iconSx} /></InputAdornment> }}
              />
              <TextField fullWidth label="Phone Number" name="contact_number" value={formData.contact_number}
                onChange={handleChange} error={!!errors.contact_number} helperText={errors.contact_number}
                inputProps={{ maxLength: 10 }} sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={iconSx} /></InputAdornment> }}
              />
              <TextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} sx={fieldSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={iconSx} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(s => !s)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                }}
              />
              <TextField fullWidth label="Confirm Password" name="confirm_password" type="password"
                value={formData.confirm_password} onChange={handleChange}
                error={!!errors.confirm_password} helperText={errors.confirm_password} sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={iconSx} /></InputAdornment> }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '1rem', textTransform: 'none', mt: 1,
                background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#4338CA,#7C3AED)' }
              }}>
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Account'}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box component="form" onSubmit={handleVerification}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <MarkEmailRead sx={{ fontSize: 64, color: '#8B5CF6' }} />
              </Box>
              <TextField fullWidth label="6-Digit OTP" value={otp}
                onChange={e => { setOtp(e.target.value); setOtpError(''); }}
                inputProps={{ maxLength: 6 }} error={!!otpError} helperText={otpError}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '1.5rem', letterSpacing: 8, textAlign: 'center' } }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#4338CA,#7C3AED)' }
              }}>
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify & Continue'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #F3F4F6' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in →
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

export default Register;
