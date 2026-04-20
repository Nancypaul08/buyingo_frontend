import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  Alert,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getImageUrl } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        product_id: product.id,
        quantity: quantity
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Product added to cart!');
    } catch (error) {
      setError('Error adding to cart');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading product...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={getImageUrl(product.image_url)}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip label={product.category} color="primary" sx={{ mr: 1 }} />
              {product.is_featured && (
                <Chip label="Featured" color="secondary" />
              )}
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              ₹{product.price}
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Seller Information:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Name: {product.seller?.full_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {product.seller?.contact_number || 'N/A'}
              </Typography>
            </Box>

            {!product.is_sold ? (
              <Box>
                <TextField
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1 }}
                  sx={{ mr: 2, width: 100 }}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={!isAuthenticated}
                  sx={{ mt: 1 }}
                >
                  {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                </Button>
              </Box>
            ) : (
              <Alert severity="warning">
                This product has been sold
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Listed on: {new Date(product.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 