import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Button, Chip } from '@mui/material';
import {
  Security, Group, School, Email, StorefrontOutlined,
  CheckCircleOutline, ArrowForward, SupportAgent,
  LocalShipping, Bolt, Favorite, AdminPanelSettings,
  HeadsetMic, TrackChanges, Savings, People, RocketLaunch,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/* ── Flip Card Component ── */
const FlipCard = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <Box
      onClick={() => setFlipped(f => !f)}
      sx={{
        height: 260,
        perspective: '1000px',
        cursor: 'pointer',
        // On non-touch (desktop): flip on CSS hover
        '&:hover .flip-inner': {
          transform: 'rotateY(180deg)',
        },
      }}
    >
      <Box
        className="flip-inner"
        sx={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)',
          // On touch: respect clicked state
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Box sx={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 4, overflow: 'hidden',
          background: front.bg,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', p: 3, textAlign: 'center',
          boxShadow: '0 8px 32px rgba(79,70,229,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
            backdropFilter: 'blur(8px)',
          }}>
            {front.icon}
          </Box>
          <Typography variant="h6" fontWeight={900} sx={{ color: 'white', mb: 1 }}>{front.title}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{front.subtitle}</Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
            <Typography variant="caption" sx={{ color: 'white', display: { xs: 'block', md: 'none' } }}>Tap to flip</Typography>
            <Typography variant="caption" sx={{ color: 'white', display: { xs: 'none', md: 'block' } }}>Hover to learn more</Typography>
          </Box>
        </Box>
        {/* Back */}
        <Box sx={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 4, overflow: 'hidden',
          background: 'white',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', p: 3, textAlign: 'center',
          boxShadow: '0 8px 32px rgba(79,70,229,0.15)',
          border: '1px solid #E0E7FF',
        }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: '#1F2937', mb: 1.5 }}>{back.title}</Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.8 }}>{back.desc}</Typography>
          {back.points && (
            <Box sx={{ mt: 1.5, width: '100%' }}>
              {back.points.map(p => (
                <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                  <CheckCircleOutline sx={{ fontSize: 14, color: '#4F46E5', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#374151', textAlign: 'left' }}>{p}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const FLIP_CARDS = [
  {
    front: { bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)', icon: <Security sx={{ fontSize: 36, color: 'white' }} />, title: 'Trust & Safety', subtitle: 'Verified students only' },
    back: { title: 'Trust & Safety', desc: 'Every user is verified, every transaction is monitored for a safe campus trading experience.', points: ['Email verification required', 'Real-time fraud detection', 'Dispute resolution in 48h'] },
  },
  {
    front: { bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)', icon: <Group sx={{ fontSize: 36, color: 'white' }} />, title: 'Community First', subtitle: 'Built by students, for students' },
    back: { title: 'Community First', desc: 'Our platform prioritizes community needs and creates meaningful connections between campus peers.', points: ['Student-only marketplace', 'Campus-based trading', 'Peer-to-peer connections'] },
  },
  {
    front: { bg: 'linear-gradient(135deg,#10B981,#059669)', icon: <School sx={{ fontSize: 36, color: 'white' }} />, title: 'Student Focused', subtitle: 'Affordable & flexible' },
    back: { title: 'Student Focused', desc: 'Every feature is designed with the unique needs and challenges of student life in mind.', points: ['Affordable pricing', 'Flexible return policy', 'Student-friendly support'] },
  },
  {
    front: { bg: 'linear-gradient(135deg,#F59E0B,#EF4444)', icon: <Bolt sx={{ fontSize: 36, color: 'white' }} />, title: 'Fast & Easy', subtitle: 'List in under 2 minutes' },
    back: { title: 'Fast & Easy', desc: 'Selling your items has never been easier. List a product in under 2 minutes and reach hundreds of students.', points: ['Quick product listing', 'Instant notifications', 'Simple checkout process'] },
  },
  {
    front: { bg: 'linear-gradient(135deg,#06B6D4,#3B82F6)', icon: <LocalShipping sx={{ fontSize: 36, color: 'white' }} />, title: 'Safe Delivery', subtitle: 'Campus-only zones' },
    back: { title: 'Safe Delivery', desc: 'Secure handoff at designated campus spots with buyer protection on all transactions.', points: ['Campus delivery zones', 'Digital receipts', '48-hour return policy'] },
  },
  {
    front: { bg: 'linear-gradient(135deg,#EF4444,#F97316)', icon: <Favorite sx={{ fontSize: 36, color: 'white' }} />, title: 'Made with Love', subtitle: 'Passion-driven platform' },
    back: { title: 'Made with Love', desc: 'BuyinGo was built with genuine passion to solve real problems faced by students every day on campus.', points: ['Student-founded startup', 'Constantly improving', 'Community-driven features'] },
  },
];



const About = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: 'white', py: { xs: 10, md: 16 }, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: '2px solid rgba(79,70,229,0.2)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.15)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(79,70,229,0.15)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(79,70,229,0.25) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3, backgroundColor: 'rgba(79,70,229,0.3)', borderRadius: 99, px: 2.5, py: 1, border: '1px solid rgba(79,70,229,0.4)' }}>
            <StorefrontOutlined sx={{ fontSize: 16, color: '#A5B4FC' }} />
            <Typography variant="body2" fontWeight={700} sx={{ color: '#A5B4FC', letterSpacing: 0.5 }}>India's #1 Campus Marketplace</Typography>
          </Box>

          <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2.4rem', md: '3.8rem' }, lineHeight: 1.1, mb: 2.5 }}>
            About{' '}
            <Box component="span" sx={{ background: 'linear-gradient(90deg,#818CF8,#C084FC,#F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BuyinGo
            </Box>
          </Typography>

          <Typography sx={{ opacity: 0.8, maxWidth: 560, mx: 'auto', fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.8, mb: 4 }}>
            The trusted campus marketplace connecting students across colleges for safe, affordable, and community-driven trading.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/')} endIcon={<ArrowForward />}
              sx={{ backgroundColor: '#4F46E5', fontWeight: 800, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', boxShadow: '0 8px 30px rgba(79,70,229,0.5)', '&:hover': { backgroundColor: '#4338CA' } }}>
              Browse Marketplace
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/register')}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'white' } }}>
              Join Free
            </Button>
          </Box>
        </Container>
      </Box>



      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>

        {/* ── Our Story ── */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip label="Our Story" sx={{ mb: 2, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
              <Typography variant="h4" fontWeight={900} sx={{ color: '#1F2937', mb: 3, lineHeight: 1.2 }}>
                Why We Built{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  BuyinGo
                </Box>
              </Typography>
              {[
                'BuyinGo was founded with a simple mission: to create a safe, trusted marketplace where college students can buy and sell items within their campus community.',
                'We understand the unique needs of student life — tight budgets, temporary living situations, and the constant need for textbooks, electronics, and daily essentials.',
                'Every transaction on BuyinGo is built on trust, verification, and community values — ensuring you always deal with verified fellow students.',
              ].map((text, i) => (
                <Typography key={i} variant="body1" sx={{ color: '#4B5563', lineHeight: 1.9, mb: 2, fontSize: '1.02rem' }}>{text}</Typography>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{
                background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#8B5CF6 100%)',
                borderRadius: 4, p: 4, color: 'white', position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <Typography variant="h5" fontWeight={900} sx={{ mb: 3, position: 'relative' }}>Our Mission</Typography>
                {[
                  { icon: <TrackChanges sx={{ fontSize: 22, color: 'rgba(255,255,255,0.9)' }} />, text: 'Make campus trading safe and easy' },
                  { icon: <Savings sx={{ fontSize: 22, color: 'rgba(255,255,255,0.9)' }} />, text: 'Help students save money on essentials' },
                  { icon: <People sx={{ fontSize: 22, color: 'rgba(255,255,255,0.9)' }} />, text: 'Build a trusted student community' },
                  { icon: <RocketLaunch sx={{ fontSize: 22, color: 'rgba(255,255,255,0.9)' }} />, text: 'Empower students to earn from unused items' },
                ].map(m => (
                  <Box key={m.text} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, position: 'relative' }}>
                    <Box sx={{ flexShrink: 0 }}>{m.icon}</Box>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{m.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── Flip Cards ── */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="What We Stand For" sx={{ mb: 2, backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#1F2937', mb: 1 }}>Our Core Values</Typography>
            <Typography variant="body1" color="text.secondary">Hover over each card to discover more</Typography>
          </Box>
          <Grid container spacing={3}>
            {FLIP_CARDS.map((card, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <FlipCard front={card.front} back={card.back} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Team Flip Cards ── */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="Meet the Team" sx={{ mb: 2, backgroundColor: '#F5F3FF', color: '#8B5CF6', fontWeight: 700 }} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#1F2937', mb: 1 }}>The People Behind BuyinGo</Typography>
            <Typography variant="body1" color="text.secondary">Hover over each card to get in touch</Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {[
              {
                front: { bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)', icon: <AdminPanelSettings sx={{ fontSize: 36, color: 'white' }} />, title: 'Platform Administrator', subtitle: 'Admin & Operations' },
                back: { title: 'Platform Administrator', desc: 'Manages platform operations, user verification, and maintains safety standards across BuyinGo.', points: ['nancy@buyingo.shop', 'Responds within 24 hours', 'Admin & Operations'] },
              },
              {
                front: { bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)', icon: <HeadsetMic sx={{ fontSize: 36, color: 'white' }} />, title: 'Customer Support', subtitle: 'Support & Experience' },
                back: { title: 'Customer Support', desc: 'Handles customer inquiries, technical support, and ensures a smooth experience for all users.', points: ['annieupadhyay@buyingo.shop', 'Responds within 12 hours', 'Support & Experience'] },
              },
            ].map((card, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <FlipCard front={card.front} back={card.back} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── CTA ── */}
        <Box sx={{
          background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
          p: { xs: 5, md: 8 }, textAlign: 'center', borderRadius: 4, color: 'white',
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 50%, rgba(79,70,229,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5, backgroundColor: 'rgba(79,70,229,0.3)', borderRadius: 99, px: 2.5, py: 1, border: '1px solid rgba(79,70,229,0.4)' }}>
              <SupportAgent sx={{ fontSize: 16, color: '#A5B4FC' }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: '#A5B4FC' }}>We're here to help</Typography>
            </Box>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Need Help or Have Questions?
            </Typography>
            <Typography sx={{ mb: 4, opacity: 0.8, maxWidth: 500, mx: 'auto', fontSize: '1.05rem' }}>
              Our team is ready to help with any questions, concerns, or technical issues.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" startIcon={<Email />}
                component="a" href="mailto:contact@buyingo.shop"
                sx={{ backgroundColor: 'white', color: '#4F46E5', fontWeight: 800, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', '&:hover': { backgroundColor: '#EEF2FF', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                Contact Us
              </Button>
              <Button variant="outlined" size="large" startIcon={<StorefrontOutlined />} endIcon={<ArrowForward />}
                onClick={() => navigate('/')}
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'white' } }}>
                Browse Marketplace
              </Button>
            </Box>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default About;
