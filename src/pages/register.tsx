import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
} from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Fjalëkalimi duhet të jetë të paktën 6 karaktere');
      setLoading(false);
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Ky email është tashmë i regjistruar');
      } else {
        setError('Dështoi krijimi i llogarisë');
      }
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
              Regjistrim
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 1, width: '100%' }}>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Konfirmo Fjalëkalimin"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Regjistrohu'}
            </Button>
            <Button
              fullWidth
              variant="text"
              href="/login"
            >
              Tashmë keni një llogari? Hyni
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;