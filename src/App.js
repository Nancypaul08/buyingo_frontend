import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminPanel from './pages/AdminPanel';
import AddProduct from './pages/AddProduct';
import About from './pages/About';
import Checkout from './pages/Checkout';
import SearchResults from './pages/SearchResults';
import CategoryProducts from './pages/CategoryProducts';

// Create theme
const theme = createTheme({
  typography: {
    fontFamily: 'sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  palette: {
    primary: { main: '#4F46E5', dark: '#4338CA' },
    secondary: { main: '#8B5CF6', dark: '#7C3AED' },
    background: { default: '#F9FAFB', paper: '#ffffff' },
    success: { main: '#10B981' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 700, textTransform: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 14 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 14 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/category/:category" element={<CategoryProducts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/add-product" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sell" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
