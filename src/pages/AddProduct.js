import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';


const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();

  // Fetch existing categories from products
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products');
      const products = response.data;
      
      // Extract unique categories from existing products
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      
      // Add categories that match the homepage design
      const defaultCategories = [
        'Air Cooler',
        'Water Bottles',
        'Coffee Mugs',
        'Buckets',
        'Pillows',
        'LED Lights',
        'Routers',
        'Mattresses',
        'Formal Suits',
        'Formal Shoes',
        'Hangers',
        'Soft Toys'
      ];
      
      // Combine existing and default categories, remove duplicates
      const allCategories = [...new Set([...uniqueCategories, ...defaultCategories])];
      
      setCategories(allCategories.sort());
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        'Air Cooler',
        'Water Bottles',
        'Coffee Mugs',
        'Buckets',
        'Pillows',
        'LED Lights',
        'Routers',
        'Mattresses',
        'Formal Suits',
        'Formal Shoes',
        'Hangers',
        'Soft Toys'
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await api.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Product added successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Add New Product
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Product Name"
            name="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            label="Price (₹)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
              disabled={loadingCategories}
            >
              {loadingCategories ? (
                <MenuItem disabled>
                  Loading categories...
                </MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" fullWidth>
                Upload Product Image
              </Button>
            </label>
            {image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {image.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddProduct; 