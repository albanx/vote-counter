import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Link from 'next/link';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { CloudOff } from '@mui/icons-material';
import { Theme, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: '8px 12px',
}));

export default function MainNavBar({ isOffline }: { isOffline?: boolean }) {
  const theme = useTheme() as Theme;
  const [open, setOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="sticky"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button variant="text" color="info" size="small" href="/">
                Numerimi i votave
              </Button>
              <Button variant="text" color="info" size="small" href="/dashboard">
                Statistikat e votave
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            {isOffline && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.warning.light }}>
                <CloudOff sx={{ mr: 1 }} />
                <Typography variant="body2">Offline</Typography>
              </Box>
            )}
            {isLoggedIn ? (
              <Button color="primary" variant="outlined" size="small" onClick={handleLogout}>
                Dil
              </Button>
            ) : (
              <>
                <Button color="primary" variant="text" size="small" href="/login">
                  Hyr
                </Button>
                <Button color="primary" variant="contained" size="small" href="/register">
                  Regjistrohu
                </Button>
              </>
            )}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <MenuItem component={Link} href='/'>Numerimi i votave</MenuItem>
                <MenuItem component={Link} href="/dashboard">Statistikat e votave</MenuItem>
                <Divider sx={{ my: 3 }} />
                {isLoggedIn ? (
                  <MenuItem>
                    <Button color="primary" variant="outlined" fullWidth onClick={handleLogout}>
                      Dil
                    </Button>
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem>
                      <Button color="primary" variant="contained" fullWidth href='/register'>
                        Regjistrohu
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button color="primary" variant="outlined" fullWidth href='/login'>
                        Hyr
                      </Button>
                    </MenuItem>
                  </>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
