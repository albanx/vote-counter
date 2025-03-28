import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  incrementPositive,
  incrementNegative,
  incrementInvalid,
  decrementPositive,
  decrementNegative,
  decrementInvalid
} from '../store/votesSlice';
import { auth } from '../firebaseConfig';
import { useEffect, useState, useRef } from 'react';
import { saveVote, decrementVote, subscribeToLocationCounts } from '../lib/firebase';
import { Timestamp, Unsubscribe } from 'firebase/firestore';
import LocationSelector from './LocationSelector';
import DisputeDialog from './DisputeDialog';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import {
  CheckCircleOutline,
  CancelOutlined,
  ErrorOutline,
} from '@mui/icons-material';

const VoteCounter = () => {
  const user = auth.currentUser;
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state: RootState) => state.location);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [currentVoteId, setCurrentVoteId] = useState('');
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const positiveVotes = useSelector((state: RootState) => (state.votes as any).positive);
  const negativeVotes = useSelector((state: RootState) => (state.votes as any).negative);
  const invalidVotes = useSelector((state: RootState) => (state.votes as any).invalid);

  useEffect(() => {
    let mounted = true;

    // Subscribe to real-time vote count updates when location changes
    if (selectedLocation && selectedLocation.region && selectedLocation.city && selectedLocation.kzaz) {
      subscribeToLocationCounts(
        selectedLocation.region,
        selectedLocation.city,
        selectedLocation.kzaz,
        (counts) => {
          if (mounted) {
            dispatch({ type: 'votes/setVotes', payload: counts });
          }
        }
      ).then(unsubscribe => {
        if (mounted) {
          // Store the unsubscribe function
          unsubscribeRef.current = unsubscribe;
        } else {
          // If component unmounted before subscription established, unsubscribe immediately
          unsubscribe();
        }
      }).catch(error => {
        console.error('Error setting up subscription:', error);
      });
    }

    // Cleanup subscription on unmount or location change
    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedLocation, dispatch]);

  const handleVote = async (type: 'positive' | 'negative' | 'invalid') => {
    if (!user || !selectedLocation || !selectedLocation.region || !selectedLocation.city || !selectedLocation.kzaz) return;

    const voteId = `vote_${Date.now()}`;
    const voteData = {
      id: voteId,
      userId: user.uid,
      type,
      timestamp: Timestamp.now(),
      region: selectedLocation.region,
      city: selectedLocation.city,
      kzaz: selectedLocation.kzaz,
    };

    try {
      // Update Redux store immediately for UI responsiveness
      if (type === 'positive') dispatch(incrementPositive());
      if (type === 'negative') dispatch(incrementNegative());
      if (type === 'invalid') {
        dispatch(incrementInvalid());
        setCurrentVoteId(voteId);
        setDisputeDialogOpen(true);
      }

      // Save to Firestore
      await saveVote(voteData);
    } catch (error) {
      console.error('Error saving vote:', error);
      // Redux will be updated by the Firestore subscription
    }
  };

  const handleDecrement = async (type: 'positive' | 'negative' | 'invalid') => {
    if (!user || !selectedLocation || !selectedLocation.region || !selectedLocation.city || !selectedLocation.kzaz) return;

    try {
      // Update Redux store immediately for UI responsiveness
      if (type === 'positive') dispatch(decrementPositive());
      if (type === 'negative') dispatch(decrementNegative());
      if (type === 'invalid') dispatch(decrementInvalid());

      // Update Firestore
      await decrementVote(
        type,
        selectedLocation.region,
        selectedLocation.city,
        selectedLocation.kzaz
      );
    } catch (error) {
      console.error('Error decrementing vote:', error);
      // Redux will be updated by the Firestore subscription
    }
  };

  const handleCloseDisputeDialog = () => {
    setDisputeDialogOpen(false);
  };

  return (
    <Container maxWidth="md">
      <DisputeDialog
        open={disputeDialogOpen}
        onClose={handleCloseDisputeDialog}
        voteId={currentVoteId}
      />
      <Box>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Numëruesi i Votave
          </Typography>

          <Box sx={{ my: 4 }}>
            <LocationSelector />
          </Box>
          
          {selectedLocation?.region && selectedLocation.city && selectedLocation.kzaz ? (
            <>
              <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  Vendndodhja e Zgjedhur:
                </Typography>
                <Typography>Rajoni: {selectedLocation.region}</Typography>
                <Typography>Qyteti: {selectedLocation.city}</Typography>
                <Typography>KZAZ: {selectedLocation.kzaz}</Typography>
              </Paper>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="success"
                  onClick={() => handleVote('positive')}
                  startIcon={<CheckCircleOutline />}
                  sx={{ py: 3 }}
                >
                  Votë e Vlefshme
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="error"
                  onClick={() => handleVote('negative')}
                  startIcon={<CancelOutlined />}
                  sx={{ py: 3 }}
                >
                  Votë e Pavlefshme
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="warning"
                  onClick={() => handleVote('invalid')}
                  startIcon={<ErrorOutline />}
                  sx={{ py: 3 }}
                >
                  Votë e Kontestuar
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ my: 2 }}>
              Ju lutem zgjidhni një vendndodhje për të filluar numërimin
            </Alert>
          )}
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 4,
            mb: 2
          }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Vota të Vlefshme</Typography>
              <Typography variant="h4">{positiveVotes}</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Vota të Pavlefshme</Typography>
              <Typography variant="h4">{negativeVotes}</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Vota të Kontestuara</Typography>
              <Typography variant="h4">{invalidVotes}</Typography>
            </Paper>
          </Box>

          {/* Decrease Buttons */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 3
          }}>
            <Button
              fullWidth
              size="medium"
              variant="outlined"
              color="success"
              onClick={() => handleDecrement('positive')}
              sx={{ py: 1 }}
            >
              Anulo Votë të Vlefshme (-1)
            </Button>
            <Button
              fullWidth
              size="medium"
              variant="outlined"
              color="error"
              onClick={() => handleDecrement('negative')}
              sx={{ py: 1 }}
            >
              Anulo Votë të Pavlefshme (-1)
            </Button>
            <Button
              fullWidth
              size="medium"
              variant="outlined"
              color="warning"
              onClick={() => handleDecrement('invalid')}
              sx={{ py: 1 }}
            >
              Anulo Votë të Kontestuar (-1)
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VoteCounter;
