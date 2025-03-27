import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import {
  HowToVote,
  Dashboard,
  ExitToApp,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { auth } from '../firebaseConfig';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const Navigation = ({ isOpen, onClose, onOpen }: NavigationProps) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
      onClose();
    } catch (error) {
      console.error('Gabim gjatë daljes:', error);
    }
  };

  const menuItems = [
    {
      text: 'Numërimi i Votave',
      icon: <HowToVote />,
      path: '/',
    },
    {
      text: 'Paneli i Kontrollit',
      icon: <Dashboard />,
      path: '/dashboard',
    },
  ];

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="menu"
        onClick={onOpen}
        edge="start"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={isOpen} onClose={onClose}>
        <List sx={{ width: 250 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'action.hover'
                },
                backgroundColor: router.pathname === item.path ? 'action.selected' : 'transparent'
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Divider />
          <ListItem
            onClick={handleLogout}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Dilni" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;