import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: reset token and new password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess('Password reset code sent! Check your email and the backend terminal for the code.');
      setStep(2);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await resetPassword(email, resetToken, newPassword);
    
    if (result.success) {
      setSuccess('Password reset successful! You can now login with your new password.');
      setStep(3);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {step === 1 && (
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a password reset code.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={handleResetSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter the 6-digit code from your email (or check the backend terminal) and your new password.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="resetToken"
              label="6-Digit Reset Code"
              name="resetToken"
              autoFocus
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              inputProps={{ maxLength: 6 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              Password Reset Complete!
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
            >
              Go to Login
            </Button>
          </Box>
        )}

        {step < 3 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Login
            </Link>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
