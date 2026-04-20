import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Button, Divider, Radio, RadioGroup,
  FormControlLabel, FormControl, CircularProgress, Snackbar, Alert,
  Stepper, Step, StepLabel, Card, CardContent, TextField, Chip,
} from '@mui/material';
import {
  LocalShipping, CreditCard, AccountBalance, PhoneAndroid, CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const steps = ['Payment Method', 'Payment Details', 'Confirmation'];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', icon: '🟢' },
  { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
  { id: 'paytm', label: 'Paytm', icon: '🔵' },
  { id: 'other', label: 'Other UPI', icon: '💳' },
];

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Other',
];

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
  const [upiApp, setUpiApp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [bankError, setBankError] = useState('');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});
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

  const validatePaymentDetails = () => {
    if (paymentMethod === 'upi') {
      if (!upiApp) { showToast('Please select a UPI app'); return false; }
      if (!upiId.trim()) { setUpiError('UPI ID is required'); return false; }
      if (!/^[\w.\-_]{3,}@[a-zA-Z]{3,}$/.test(upiId.trim())) {
        setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return false;
      }
    }
    if (paymentMethod === 'netbanking' && !selectedBank) {
      setBankError('Please select a bank'); return false;
    }
    if (paymentMethod === 'card') {
      const errs = {};
      if (!cardData.number.replace(/\s/g, '').match(/^\d{16}$/)) errs.number = 'Enter a valid 16-digit card number';
      if (!cardData.name.trim()) errs.name = 'Cardholder name is required';
      if (!cardData.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) errs.expiry = 'Enter valid expiry (MM/YY)';
      if (!cardData.cvv.match(/^\d{3,4}$/)) errs.cvv = 'Enter valid CVV';
      setCardErrors(errs);
      if (Object.keys(errs).length > 0) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !paymentMethod) { showToast('Please select a payment method'); return; }
    if (activeStep === 1 && !validatePaymentDetails()) return;
    setActiveStep(s => s + 1);
  };

  const handlePlaceOrder = async () => {
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

    setProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { showToast('Failed to load payment gateway. Check your internet connection.'); setProcessing(false); return; }

      const { data: orderData } = await api.post('/payment/create-order');

      // Build prefill based on payment method
      const prefill = {};
      if (paymentMethod === 'upi') prefill.vpa = upiId;

      const rzpMethod = paymentMethod === 'upi' ? 'upi'
        : paymentMethod === 'netbanking' ? 'netbanking'
        : paymentMethod === 'card' ? 'card'
        : undefined;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BuyinGo',
        description: 'Student Marketplace Purchase',
        order_id: orderData.razorpay_order_id,
        prefill,
        config: rzpMethod === 'upi' ? {
          display: { blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: false } }
        } : undefined,
        handler: async (response) => {
          try {
            const { data } = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: paymentMethod,
            });
            setOrderSuccess({
              method: paymentMethod === 'upi' ? `UPI — ${upiApp} (${upiId})`
                : paymentMethod === 'netbanking' ? `Net Banking — ${selectedBank}`
                : `Card ending in ${cardData.number.slice(-4)}`,
              paymentId: response.razorpay_payment_id,
              order: data.order,
            });
          } catch (err) {
            showToast(err.response?.data?.error || 'Payment verification failed');
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled');
            setProcessing(false);
          },
        },
        theme: { color: '#1976d2' },
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

  const formatCardNumber = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 90, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>Payment Successful!</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>Order placed successfully</Typography>
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
            <Typography color="text.secondary">Amount Paid</Typography>
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

          {/* Step 0: Method */}
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
                        borderColor: paymentMethod === opt.value ? 'primary.main' : 'divider',
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
            </Paper>
          )}

          {/* Step 1: Details */}
          {activeStep === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>

              {paymentMethod === 'upi' && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select UPI App</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                    {UPI_APPS.map(app => (
                      <Paper key={app.id} variant="outlined" onClick={() => setUpiApp(app.label)}
                        sx={{
                          p: 1.5, cursor: 'pointer', textAlign: 'center', minWidth: 90,
                          border: upiApp === app.label ? '2px solid' : '1px solid',
                          borderColor: upiApp === app.label ? 'primary.main' : 'divider',
                        }}>
                        <Typography fontSize={24}>{app.icon}</Typography>
                        <Typography variant="caption">{app.label}</Typography>
                      </Paper>
                    ))}
                  </Box>
                  <TextField fullWidth label="UPI ID" placeholder="yourname@upi"
                    value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                    error={!!upiError} helperText={upiError} />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Razorpay will send a real payment request to your UPI app.
                  </Alert>
                </Box>
              )}

              {paymentMethod === 'netbanking' && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select Your Bank</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {BANKS.map(bank => (
                      <Paper key={bank} variant="outlined" onClick={() => { setSelectedBank(bank); setBankError(''); }}
                        sx={{
                          p: 1.5, cursor: 'pointer',
                          border: selectedBank === bank ? '2px solid' : '1px solid',
                          borderColor: selectedBank === bank ? 'primary.main' : 'divider',
                        }}>
                        <Typography variant="body2">{bank}</Typography>
                      </Paper>
                    ))}
                  </Box>
                  {bankError && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{bankError}</Typography>}
                </Box>
              )}

              {paymentMethod === 'card' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth label="Card Number" placeholder="4111 1111 1111 1111"
                    value={cardData.number} inputProps={{ maxLength: 19 }}
                    onChange={e => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                    error={!!cardErrors.number} helperText={cardErrors.number} />
                  <TextField fullWidth label="Cardholder Name"
                    value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })}
                    error={!!cardErrors.name} helperText={cardErrors.name} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField fullWidth label="Expiry (MM/YY)" placeholder="MM/YY"
                      value={cardData.expiry} inputProps={{ maxLength: 5 }}
                      onChange={e => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                      error={!!cardErrors.expiry} helperText={cardErrors.expiry} />
                    <TextField fullWidth label="CVV" type="password"
                      value={cardData.cvv} inputProps={{ maxLength: 4 }}
                      onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                      error={!!cardErrors.cvv} helperText={cardErrors.cvv} />
                  </Box>
                </Box>
              )}

              {paymentMethod === 'cod' && (
                <Alert severity="info">You will pay <strong>₹{total.toFixed(2)}</strong> in cash when your order is delivered.</Alert>
              )}
            </Paper>
          )}

          {/* Step 2: Confirm */}
          {activeStep === 2 && (
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
              <Alert severity="info">
                Payment via: <strong>
                  {paymentMethod === 'cod' ? 'Cash on Delivery'
                    : paymentMethod === 'upi' ? `UPI — ${upiApp} (${upiId})`
                    : paymentMethod === 'netbanking' ? `Net Banking — ${selectedBank}`
                    : `Card ending in ${cardData.number.slice(-4)}`}
                </strong>
              </Alert>
              {paymentMethod !== 'cod' && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Chip label="LIVE" color="success" size="small" sx={{ mr: 1 }} />
                  Real Razorpay payment — actual money will be charged.
                </Alert>
              )}
            </Paper>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button disabled={activeStep === 0 || processing} onClick={() => setActiveStep(s => s - 1)}>
              Back
            </Button>
            {activeStep < 2
              ? <Button variant="contained" onClick={handleNext}>Continue</Button>
              : (
                <Button variant="contained" color="success" onClick={handlePlaceOrder} disabled={processing}>
                  {processing
                    ? <><CircularProgress size={20} sx={{ mr: 1 }} />Processing...</>
                    : paymentMethod === 'cod' ? 'Place Order'
                    : paymentMethod === 'upi' ? 'Send UPI Request'
                    : 'Pay Now'}
                </Button>
              )
            }
          </Box>
        </Box>

        {/* Order Summary */}
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
