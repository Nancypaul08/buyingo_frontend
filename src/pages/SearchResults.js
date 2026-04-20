import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    const categoryFilter = urlParams.get('category');
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else if (categoryFilter) {
      setSearchQuery(`Category: ${categoryFilter}`);
      performCategorySearch(categoryFilter);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const searchResults = await response.json();
        setProducts(searchResults);
      } else {
        // Fallback to client-side search if API endpoint doesn't exist
        const allResponse = await fetch(`http://localhost:5001/api/products`);
        const allProducts = await allResponse.json();
        
        const searchTerms = query.toLowerCase().split(' ');
        const filteredProducts = allProducts.filter(product => {
          const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
          return searchTerms.some(term => 
            searchableText.includes(term) || 
            searchableText.split(' ').some(word => word.startsWith(term))
          );
        });
        
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const performCategorySearch = async (category) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/products`);
      const allProducts = await response.json();
      
      const filteredProducts = allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Category search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Add to cart logic here
    console.log('Adding to cart:', product);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Search Results
        </Typography>
      </Box>

      {/* Search Query Display */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Showing results for: <Chip label={searchQuery} color="primary" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {loading ? 'Searching...' : `${products.length} products found`}
        </Typography>
      </Box>

      {/* Results */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Products Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We couldn't find any products matching your search. Try different keywords or browse our categories.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Browse All Products
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

export default SearchResults;
