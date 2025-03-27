import { ReactNode, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, useTheme } from '@mui/material';
import { CloudOff } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  isOffline?: boolean;
}

const Layout = ({ children, isOffline }: LayoutProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const getPageTitle = () => {
    switch (router.pathname) {
      case '/':
        return 'Numërimi i Votave';
      case '/dashboard':
        return 'Paneli i Kontrollit';
      case '/login':
        return 'Hyrje';
      default:
        return 'Sistemi i Numërimit të Votave';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Navigation
            isOpen={drawerOpen}
            onOpen={handleDrawerOpen}
            onClose={handleDrawerClose}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          {isOffline && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.warning.light }}>
              <CloudOff sx={{ mr: 1 }} />
              <Typography variant="body2">Offline</Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

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