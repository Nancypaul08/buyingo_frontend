import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Button, Divider, Radio, RadioGroup,
  FormControlLabel, FormControl, CircularProgress, Snackbar, Alert,
  Stepper, Step, StepLabel, Card, CardContent,
} from '@mui/material';
import { LocalShipping, CreditCard, AccountBalance, PhoneAndroid, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const steps = ['Payment Method', 'Confirmation'];

const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const navigate = useNavigate();

  const showToast = (message, severity = 'error') =>
    setToast({ open: true, message, severity });

  useEffect(() => {
    api.get('/cart').then(r => setCartItems(r.data)).catch(() => navigate('/cart'));
  }, [navigate]);

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) { showToast('Please select a payment method'); return; }

    // COD — direct order
    if (paymentMethod === 'cod') {
      setProcessing(true);
      try {
        await api.post('/orders', { payment_method: 'cod' });
        setOrderSuccess({ method: 'Cash on Delivery', paymentId: null });
      } catch (err) {
        showToast(err.response?.data?.error || 'Failed to place order');
      }
      setProcessing(false);
      return;
    }

    // Online payment via Razorpay
    setProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        showToast('Failed to load Razorpay. Check your internet connection.');
        setProcessing(false);
        return;
      }

      const { data: orderData } = await api.post('/payment/create-order');

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'BuyinGo',
        description: 'Student Marketplace Purchase',
        order_id: orderData.razorpay_order_id,
        theme: { color: '#4F46E5' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: paymentMethod,
            });
            setOrderSuccess({
              method: paymentMethod === 'upi' ? 'UPI'
                : paymentMethod === 'netbanking' ? 'Net Banking'
                : 'Card',
              paymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            showToast(err.response?.data?.error || 'Payment verification failed');
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled', 'warning');
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        showToast(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 90, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {orderSuccess.paymentId ? 'Payment Successful!' : 'Order Placed!'}
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, my: 3, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Payment Method</Typography>
            <Typography fontWeight={600}>{orderSuccess.method}</Typography>
          </Box>
          {orderSuccess.paymentId && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Payment ID</Typography>
              <Typography fontWeight={600} fontSize={13}>{orderSuccess.paymentId}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Amount</Typography>
            <Typography fontWeight={700} color="primary">₹{total.toFixed(2)}</Typography>
          </Box>
        </Paper>
        <Button variant="contained" onClick={() => navigate('/orders')} sx={{ mr: 2 }}>View Orders</Button>
        <Button variant="outlined" onClick={() => navigate('/')}>Continue Shopping</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
      </Stepper>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>

          {activeStep === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Select Payment Method</Typography>
              <FormControl fullWidth>
                <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  {[
                    { value: 'cod', icon: <LocalShipping />, label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                    { value: 'upi', icon: <PhoneAndroid />, label: 'UPI', sub: 'Google Pay, PhonePe, Paytm & more' },
                    { value: 'netbanking', icon: <AccountBalance />, label: 'Net Banking', sub: 'All major banks supported' },
                    { value: 'card', icon: <CreditCard />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                  ].map(opt => (
                    <Paper key={opt.value} variant="outlined" onClick={() => setPaymentMethod(opt.value)}
                      sx={{
                        mb: 1.5, p: 1.5, cursor: 'pointer',
                        border: paymentMethod === opt.value ? '2px solid' : '1px solid',
                        borderColor: paymentMethod === opt.value ? '#4F46E5' : 'divider',
                        borderRadius: 2,
                      }}>
                      <FormControlLabel value={opt.value} control={<Radio />} label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {opt.icon}
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{opt.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{opt.sub}</Typography>
                          </Box>
                        </Box>
                      } />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
              <Button variant="contained" fullWidth sx={{ mt: 2 }}
                onClick={() => { if (!paymentMethod) { showToast('Please select a payment method'); return; } setActiveStep(1); }}>
                Continue
              </Button>
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Confirm Order</Typography>
              {cartItems.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.product.name} × {item.quantity}</Typography>
                  <Typography variant="body2">₹{(item.product.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight={600}>Total</Typography>
                <Typography fontWeight={600} color="primary">₹{total.toFixed(2)}</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Payment via: <strong>
                  {paymentMethod === 'cod' ? 'Cash on Delivery'
                    : paymentMethod === 'upi' ? 'UPI'
                    : paymentMethod === 'netbanking' ? 'Net Banking'
                    : 'Card'}
                </strong>
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={() => setActiveStep(0)} disabled={processing}>Back</Button>
                <Button variant="contained" color="success" fullWidth onClick={handlePlaceOrder} disabled={processing}>
                  {processing
                    ? <><CircularProgress size={20} sx={{ mr: 1 }} />Processing...</>
                    : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                </Button>
              </Box>
            </Paper>
          )}
        </Box>

        <Box sx={{ width: { xs: '100%', md: 280 } }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              {cartItems.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                    {item.product.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">₹{(item.product.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={600}>Total</Typography>
                <Typography fontWeight={600} color="primary">₹{total.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout;
