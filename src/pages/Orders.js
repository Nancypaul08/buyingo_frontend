import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Grid, Chip, Box,
  Accordion, AccordionSummary, AccordionDetails, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Alert, Snackbar,
} from '@mui/material';
import { ExpandMore, CreditCard, PhoneAndroid, AccountBalance, LocalShipping } from '@mui/icons-material';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${cancelDialog.orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === cancelDialog.orderId ? data.order : o));
      setToast({
        open: true,
        message: data.refund_id
          ? `Order cancelled. Refund of ₹${data.order.total_amount} initiated (Refund ID: ${data.refund_id}). It will reflect in 5–7 business days.`
          : 'Order cancelled successfully.',
        severity: 'success'
      });
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.error || 'Failed to cancel order', severity: 'error' });
    }
    setCancelling(false);
    setCancelDialog({ open: false, orderId: null });
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'upi': return { label: 'UPI', icon: <PhoneAndroid fontSize="small" /> };
      case 'netbanking': return { label: 'Net Banking', icon: <AccountBalance fontSize="small" /> };
      case 'card': return { label: 'Card', icon: <CreditCard fontSize="small" /> };
      case 'cod': return { label: 'Cash on Delivery', icon: <LocalShipping fontSize="small" /> };
      default: return { label: method || 'Online', icon: <CreditCard fontSize="small" /> };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'confirmed': return 'info';
      case 'placed': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'placed':
        return 1;
      case 'confirmed':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 1;
    }
  };

  const OrderStatusStepper = ({ status }) => {
    const currentStep = getStatusStep(status);
    const steps = [
      { label: 'Order Placed', status: 'placed' },
      { label: 'Order Confirmed', status: 'confirmed' },
      { label: 'Delivered', status: 'delivered' }
    ];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.status}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 80
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: currentStep > index ? '#10B981' : currentStep === index + 1 ? '#2563EB' : '#E5E7EB',
                  color: currentStep >= index + 1 ? 'white' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {currentStep > index ? '✓' : index + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: currentStep >= index + 1 ? '#1F2937' : '#9CA3AF',
                  fontWeight: currentStep === index + 1 ? 600 : 400,
                  textAlign: 'center'
                }}
              >
                {step.label}
              </Typography>
            </Box>
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  backgroundColor: currentStep > index + 1 ? '#10B981' : '#E5E7EB',
                  mx: 1
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No orders found
        </Typography>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.created_at)}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Total: ₹{order.total_amount}
                  </Typography>
                  {/* Payment Method + Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      {getPaymentMethodLabel(order.payment_method).icon}
                      <Typography variant="body2">{getPaymentMethodLabel(order.payment_method).label}</Typography>
                    </Box>
                    <Chip
                      label={order.payment_status === 'paid' ? 'PAID' : order.payment_status === 'refunded' ? 'REFUNDED' : 'UNPAID'}
                      color={order.payment_status === 'paid' ? 'success' : order.payment_status === 'refunded' ? 'info' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  {order.razorpay_payment_id && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Payment ID: {order.razorpay_payment_id}
                    </Typography>
                  )}
                  {order.payment_status === 'refunded' && (
                    <Alert severity="info" sx={{ mt: 1, py: 0 }}>Refund initiated — reflects in 5–7 business days</Alert>
                  )}
                  {/* Cancel button */}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <Button
                      variant="outlined" color="error" size="small" sx={{ mt: 1.5 }}
                      onClick={() => setCancelDialog({ open: true, orderId: order.id })}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                  <OrderStatusStepper status={order.status} />
                </Grid>
              </Grid>

              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Order Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {order.items.map((item) => (
                      <Grid size={{ xs: 12 }} key={item.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1">
                            ₹{item.price_at_time * item.quantity}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        ))
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => !cancelling && setCancelDialog({ open: false, orderId: null })}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order?
            {orders.find(o => o.id === cancelDialog.orderId)?.payment_status === 'paid' &&
              ' Since you paid online, a full refund will be initiated automatically and will reflect in 5–7 business days.'}
            {orders.find(o => o.id === cancelDialog.orderId)?.payment_method === 'cod' &&
              ' This is a Cash on Delivery order, so no refund is needed.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, orderId: null })} disabled={cancelling}>Keep Order</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained" disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={8000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders; 