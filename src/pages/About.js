import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import {
  Security, Group, School, Email, StorefrontOutlined,
  VerifiedUser, AccessTime, CheckCircleOutline, ArrowForward,
  SupportAgent, LocalShipping,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CORE_VALUES = [
  {
    icon: <Security sx={{ fontSize: 36, color: 'white' }} />,
    title: 'Trust & Safety',
    desc: 'Every user is verified, every transaction is monitored, and every interaction is designed to build trust within the student community.',
    color: '#4F46E5',
  },
  {
    icon: <Group sx={{ fontSize: 36, color: 'white' }} />,
    title: 'Community First',
    desc: "We're built by students, for students. Our platform prioritizes community needs and creates meaningful connections between campus peers.",
    color: '#8B5CF6',
  },
  {
    icon: <School sx={{ fontSize: 36, color: 'white' }} />,
    title: 'Student Focused',
    desc: 'From affordable pricing to flexible policies, every feature is designed with the unique needs and challenges of student life in mind.',
    color: '#10B981',
  },
];

const SAFETY_POINTS = [
  'College email verification for all users',
  '24/7 automated content moderation',
  'Dispute resolution within 48 hours',
  'Real-time fraud detection system',
];

const DELIVERY_POINTS = [
  'Campus-only delivery zones for verified students',
  'Secure handoff at designated campus spots',
  'Digital transaction receipts for all purchases',
  'Buyer protection guarantee on all transactions',
  'Real-time delivery tracking and notifications',
  '48-hour return policy for eligible items',
];

const About = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #8B5CF6 100%)',
        color: 'white', py: { xs: 10, md: 14 }, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, px: 2, py: 0.8 }}>
            <StorefrontOutlined sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>India's #1 Campus Marketplace</Typography>
          </Box>
          <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.15, mb: 2 }}>
            About{' '}
            <span style={{ background: 'linear-gradient(90deg,#A5F3FC,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BuyinGo
            </span>
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.88, fontWeight: 400, maxWidth: 560, mx: 'auto', fontSize: { xs: '1rem', md: '1.15rem' } }}>
            The trusted campus marketplace connecting students across colleges for safe and affordable trading.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>

        {/* Our Story */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 4, border: '1px solid #E0E7FF' }}>
          <Chip label="Our Story" sx={{ mb: 2, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
          <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: '#1F2937' }}>
            Why We Built BuyinGo
          </Typography>
          {[
            'BuyinGo was founded with a simple mission: to create a safe, trusted marketplace where college students can buy and sell items within their campus community. We understand the unique needs of student life — tight budgets, temporary living situations, and the constant need for textbooks, electronics, and daily essentials.',
            'What started as a small project has grown into a comprehensive platform serving thousands of students across multiple colleges. Every transaction on BuyinGo is built on trust, verification, and community values.',
            'Our platform ensures that every user is a verified student, creating a secure environment where you can trade with confidence, knowing you\'re dealing with fellow students from your academic community.',
          ].map((text, i) => (
            <Typography key={i} variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#4B5563', mb: i < 2 ? 2.5 : 0 }}>
              {text}
            </Typography>
          ))}
        </Paper>

        {/* Contact Cards */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip label="Get in Touch" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>Contact Our Team</Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              { initials: 'PA', name: 'Platform Administrator', role: 'Admin Contact', email: 'nancy@buyingo.shop', time: 'Within 24 hours', desc: 'Nancy manages platform operations, user verification, dispute resolution, and maintains the safety standards that make BuyinGo trusted by students nationwide.', color: '#4F46E5', bg: '#EEF2FF' },
              { initials: 'AU', name: 'Customer Support', role: 'Support Contact', email: 'annieupadhyay@buyingo.shop', time: 'Within 12 hours', desc: 'Annie handles customer inquiries, technical support, and ensures smooth user experience across all BuyinGo services and features.', color: '#8B5CF6', bg: '#F5F3FF' },
            ].map(c => (
              <Grid size={{ xs: 12, md: 6 }} key={c.name}>
                <Card elevation={0} sx={{ p: 1, borderRadius: 4, border: '1px solid #E0E7FF', backgroundColor: 'white', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(79,70,229,0.12)', borderColor: '#A5B4FC' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <Box sx={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0 }}>
                        <Typography fontWeight={800} sx={{ color: 'white', fontSize: '1rem' }}>{c.initials}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#1F2937', lineHeight: 1.2 }}>{c.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>{c.role}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Email sx={{ fontSize: 16, color: c.color }} />
                      <Typography variant="body2" sx={{ color: c.color, fontWeight: 600 }}>{c.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccessTime sx={{ fontSize: 16, color: '#9CA3AF' }} />
                      <Typography variant="body2" color="text.secondary">Response time: {c.time}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{c.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Safety & Delivery */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip label="How We Operate" sx={{ mb: 1.5, backgroundColor: '#ECFDF5', color: '#10B981', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>Safety & Delivery</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ p: 1, borderRadius: 4, border: '1px solid #D1FAE5', backgroundColor: 'white', height: '100%', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(16,185,129,0.12)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Security sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#1F2937' }}>How We Manage Safety</Typography>
                      <Typography variant="caption" color="text.secondary">Security First</Typography>
                    </Box>
                  </Box>
                  {SAFETY_POINTS.map(p => (
                    <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
                      <CheckCircleOutline sx={{ fontSize: 18, color: '#10B981', mt: 0.1, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#374151' }}>{p}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ p: 1, borderRadius: 4, border: '1px solid #D1FAE5', backgroundColor: 'white', height: '100%', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(5,150,105,0.12)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocalShipping sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#1F2937' }}>Safe Delivery & Protection</Typography>
                      <Typography variant="caption" color="text.secondary">Secure Campus Delivery Network</Typography>
                    </Box>
                  </Box>
                  {DELIVERY_POINTS.map(p => (
                    <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
                      <CheckCircleOutline sx={{ fontSize: 18, color: '#059669', mt: 0.1, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#374151' }}>{p}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Core Values */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip label="What We Stand For" sx={{ mb: 1.5, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1F2937' }}>Our Core Values</Typography>
          </Box>
          <Grid container spacing={3}>
            {CORE_VALUES.map(v => (
              <Grid size={{ xs: 12, md: 4 }} key={v.title}>
                <Card elevation={0} sx={{ p: 1, borderRadius: 4, border: '1px solid #E0E7FF', backgroundColor: 'white', textAlign: 'center', height: '100%', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(79,70,229,0.12)', borderColor: '#A5B4FC' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ width: 68, height: 68, borderRadius: 3, backgroundColor: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                      {v.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#1F2937' }}>{v.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{v.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Help CTA */}
        <Box sx={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', p: { xs: 4, md: 7 }, textAlign: 'center', borderRadius: 4, color: 'white' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, px: 2, py: 0.8 }}>
            <SupportAgent sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>We're here to help</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
            Need Help or Have Questions?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.88, maxWidth: 500, mx: 'auto' }}>
            Our team is here to help with any questions, concerns, or technical issues you might have.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={<Email />}
              component="a" href="mailto:contact@buyingo.shop"
              sx={{ backgroundColor: 'white', color: '#4F46E5', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#EEF2FF', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
              Contact Us
            </Button>
            <Button variant="outlined" size="large" startIcon={<StorefrontOutlined />} endIcon={<ArrowForward />}
              onClick={() => navigate('/')}
              sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'white' } }}>
              Browse Marketplace
            </Button>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default About;
