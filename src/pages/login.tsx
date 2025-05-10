import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError('Email ose fjalëkalimi i pavlefshëm');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err) {
      setError('Hyrja me Google dështoi. Ju lutemi provoni përsëri.');
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
          <img src="/levizjabashke.svg" alt="Levizja Bashke" style={{ width: '200px', marginBottom: '2rem' }} />
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box mb={4} display="flex" flexDirection="column" alignItems="center">
            <img src="/levizjabashke.svg" alt="Levizja Bashke" style={{ width: '180px', marginBottom: '1.5rem' }} />
            <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
              Hyrje në Sistem
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Fjalëkalimi"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Hyrje'}
            </Button>
            <Divider sx={{ mt: 2, mb: 2 }}>OSE</Divider>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ 
                mt: 1,
                mb: 2,
                backgroundColor: '#fff',
                color: '#757575',
                border: '1px solid #ddd',
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #ccc'
                },
                display: 'flex',
                gap: 2,
                height: '40px'
              }}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: '18px', height: '18px' }}
              />
              Vazhdo me Google
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ display: 'inline' }}>
                Nuk keni llogari? 
              </Typography>
              <Button
                href="/register"
                variant="text"
                sx={{ ml: 1 }}
              >
                Regjistrohu
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;