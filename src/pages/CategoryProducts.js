import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { ArrowBack, ShoppingCart } from '@mui/icons-material';
import { getImageUrl } from '../services/api';

const CategoryProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      fetchCategoryProducts(category);
    }
  }, [category]);

  const fetchCategoryProducts = async (categoryName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/products/category/${encodeURIComponent(categoryName)}`);
      if (response.ok) {
        const categoryProducts = await response.json();
        setProducts(categoryProducts);
      } else {
        // Fallback to filtering all products
        const allResponse = await fetch(`http://localhost:5001/api/products`);
        const allProducts = await allResponse.json();
        
        const filteredProducts = allProducts.filter(product => 
          product.category.toLowerCase() === categoryName.toLowerCase()
        );
        
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Category fetch error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Add to cart logic here
    console.log('Adding to cart:', product);
  };

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {formatCategoryName(category)}
        </Typography>
      </Box>

      {/* Category Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Browse all products in: <Chip label={formatCategoryName(category)} color="primary" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {loading ? 'Loading...' : `${products.length} products available`}
        </Typography>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading products...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Products Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We don't have any products in the {formatCategoryName(category)} category yet. Check back soon!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Browse All Categories
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(product.image_url)}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontSize: '1rem' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
                    {product.description?.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ₹{product.price}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCart(product)}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoryProducts;
