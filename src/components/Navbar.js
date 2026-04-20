import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem,
  Box, Container, TextField, InputAdornment, Drawer, List, ListItem,
  ListItemText, ListItemIcon, Divider, Avatar,
} from '@mui/material';
import {
  ShoppingCart, Search, Person, Menu as MenuIcon, Close, Home,
  Info, Login, Logout, AdminPanelSettings, Store,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchCartCount();
  }, [isAuthenticated]);

  useEffect(() => {
    // Re-fetch cart count whenever any page fires 'cartUpdated'
    const onCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', onCartUpdate);
    return () => window.removeEventListener('cartUpdated', onCartUpdate);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.reduce((s, i) => s + i.quantity, 0));
    } catch {}
  };

  const handleLogout = () => { logout(); setAnchorEl(null); setMobileMenuOpen(false); navigate('/'); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); }
  };

  return (
    <AppBar position="sticky" elevation={scrolled ? 4 : 0} sx={{
      background: 'white',
      borderBottom: scrolled ? 'none' : '1px solid #EEF2FF',
      transition: 'box-shadow 0.3s',
    }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 0.5, gap: 2 }}>
          {/* Mobile menu */}
          <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: '#4F46E5' }} onClick={() => setMobileMenuOpen(true)}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography component={Link} to="/" sx={{
            textDecoration: 'none', fontWeight: 900, fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            flexGrow: { xs: 1, md: 0 }, letterSpacing: '-0.5px',
          }}>
            BuyinGo
          </Typography>

          {/* Search */}
          <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, maxWidth: 420, display: { xs: 'none', md: 'block' } }}>
            <TextField fullWidth size="small" placeholder="Search products, categories..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 99, backgroundColor: '#F5F3FF',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#8B5CF6' },
                  '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                }
              }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#8B5CF6' }} /></InputAdornment> }}
            />
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {[{ label: 'Marketplace', to: '/' }, { label: 'About', to: '/about' }].map(item => (
              <Button key={item.to} component={Link} to={item.to} sx={{
                color: '#374151', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2,
                '&:hover': { backgroundColor: '#EEF2FF', color: '#4F46E5' }
              }}>{item.label}</Button>
            ))}

            {isAuthenticated && user?.is_admin && (
              <Button component={Link} to="/sell" sx={{
                color: '#374151', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2,
                '&:hover': { backgroundColor: '#EEF2FF', color: '#4F46E5' }
              }}>Sell Item</Button>
            )}

            {isAuthenticated ? (
              <>
                <IconButton component={Link} to="/cart" sx={{ color: '#4F46E5' }}>
                  <Badge badgeContent={cartCount} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
                {user?.is_admin && (
                  <Button component={Link} to="/admin" startIcon={<AdminPanelSettings />} sx={{
                    color: '#374151', textTransform: 'none', fontWeight: 600,
                    '&:hover': { backgroundColor: '#EEF2FF', color: '#4F46E5' }
                  }}>Admin</Button>
                )}
                <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                  <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', fontSize: '0.9rem', fontWeight: 700 }}>
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 160, boxShadow: '0 8px 30px rgba(79,70,229,0.15)' } }}>
                  <MenuItem sx={{ fontWeight: 600, color: '#4F46E5', pointerEvents: 'none' }}>
                    {user?.full_name}
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to="/orders" onClick={() => setAnchorEl(null)}>My Orders</MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={Link} to="/login" variant="outlined" sx={{
                  borderColor: '#4F46E5', color: '#4F46E5', textTransform: 'none',
                  fontWeight: 600, borderRadius: 2, px: 2.5,
                  '&:hover': { backgroundColor: '#EEF2FF' }
                }}>Login</Button>
                <Button component={Link} to="/register" variant="contained" sx={{
                  background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', textTransform: 'none',
                  fontWeight: 600, borderRadius: 2, px: 2.5, boxShadow: 'none',
                  '&:hover': { background: 'linear-gradient(135deg,#4338CA,#7C3AED)', boxShadow: '0 4px 15px rgba(79,70,229,0.4)' }
                }}>Sign Up</Button>
              </Box>
            )}
          </Box>

          {/* Mobile icons */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            {isAuthenticated ? (
              <>
                <IconButton component={Link} to="/cart" sx={{ color: '#4F46E5' }}>
                  <Badge badgeContent={cartCount} color="secondary"><ShoppingCart /></Badge>
                </IconButton>
                <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                  <Avatar sx={{ width: 30, height: 30, background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', fontSize: '0.8rem' }}>
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Button component={Link} to="/login" variant="contained" size="small" sx={{
                background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', textTransform: 'none',
                fontWeight: 600, borderRadius: 2, boxShadow: 'none'
              }}>Login</Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 280, borderRadius: '0 16px 16px 0' } }}>
        <Box sx={{ p: 2.5, background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={900} fontSize="1.4rem">BuyinGo</Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </Box>

        <Box sx={{ p: 2 }}>
          <form onSubmit={e => { handleSearch(e); setMobileMenuOpen(false); }}>
            <TextField fullWidth size="small" placeholder="Search products..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, backgroundColor: '#F5F3FF' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#8B5CF6' }} /></InputAdornment> }}
            />
          </form>
        </Box>

        <List sx={{ px: 1 }}>
          {[{ label: 'Marketplace', to: '/', icon: <Home /> }, { label: 'About Us', to: '/about', icon: <Info /> }].map(item => (
            <ListItem key={item.to} button onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: '#EEF2FF' } }}>
              <ListItemIcon sx={{ color: '#4F46E5', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
          {isAuthenticated && (
            <ListItem button onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: '#EEF2FF' } }}>
              <ListItemIcon sx={{ color: '#4F46E5', minWidth: 36 }}><ShoppingCart /></ListItemIcon>
              <ListItemText primary="My Orders" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          )}
          {isAuthenticated && user?.is_admin && (
            <ListItem button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: '#EEF2FF' } }}>
              <ListItemIcon sx={{ color: '#4F46E5', minWidth: 36 }}><AdminPanelSettings /></ListItemIcon>
              <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          )}
        </List>

        <Divider sx={{ mx: 2 }} />

        <List sx={{ px: 1, mt: 1 }}>
          {isAuthenticated ? (
            <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, '&:hover': { backgroundColor: '#FEF2F2' } }}>
              <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><Logout /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, color: '#EF4444' }} />
            </ListItem>
          ) : (
            <ListItem button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              sx={{ borderRadius: 2, '&:hover': { backgroundColor: '#EEF2FF' } }}>
              <ListItemIcon sx={{ color: '#4F46E5', minWidth: 36 }}><Login /></ListItemIcon>
              <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
