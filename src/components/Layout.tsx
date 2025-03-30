import { ReactNode } from 'react';
import { Box, Typography, Container } from '@mui/material';
import MainNavBar from './MainNavbar';

interface LayoutProps {
  children: ReactNode;
  isOffline?: boolean;
}

const Layout = ({ children, isOffline }: LayoutProps) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MainNavBar isOffline={isOffline} />

      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Sistemi i Numërimit të Votave
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;