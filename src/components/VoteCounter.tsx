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
import { saveIncrementVote, saveDecrementVote, subscribeToLocationCounts } from '../lib/firebase';
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
  TextField,
} from '@mui/material';
import {
  CheckCircleOutline,
  CancelOutlined,
} from '@mui/icons-material';

const VoteCounter = () => {
  const user = auth.currentUser;
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state: RootState) => state.location);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [currentVoteId, setCurrentVoteId] = useState('');
  const [boxNumber, setBoxNumber] = useState<number | ''>('');
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const positiveVotes = useSelector((state: RootState) => (state.votes as any).positive);
  const negativeVotes = useSelector((state: RootState) => (state.votes as any).negative);

  useEffect(() => {
    let mounted = true;

    // Subscribe to real-time vote count updates when location changes
    if (selectedLocation && selectedLocation.region && selectedLocation.city) {
      subscribeToLocationCounts(
        selectedLocation.region,
        selectedLocation.city,
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

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent,
      browser: navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)?.[1] || '',
      platform: navigator.platform
    };
    return browserInfo;
  };

  const handleVote = async (type: 'positive' | 'negative' | 'invalid') => {
    if (!user || !selectedLocation || !selectedLocation.region || !selectedLocation.city || boxNumber === '') {
      alert('Ju lutem plotësoni numrin e kutisë së votimit');
      return;
    }

    const browserInfo = getBrowserInfo();

    const voteId = `vote_${type}_add_${Date.now()}_${boxNumber}`;
    const voteData = {
      boxNumber: boxNumber+'',
      id: voteId,
      userId: user.uid,
      userEmail: user.email || '',
      type,
      timestamp: Timestamp.now(),
      region: selectedLocation.region,
      city: selectedLocation.city,
      metadata: {
        userAgent: browserInfo.userAgent,
        browser: browserInfo.browser,
        platform: browserInfo.platform,
        createdBy: user.displayName || user.email || user.uid
      }
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
      await saveIncrementVote(voteData);
    } catch (error) {
      console.error('Error saving vote:', error);
      // Redux will be updated by the Firestore subscription
    }
  };

  const handleDecrement = async (type: 'positive' | 'negative' | 'invalid') => {
    if (!user || !selectedLocation || !selectedLocation.region || !selectedLocation.city) return;

    const browserInfo = getBrowserInfo();

    const voteId = `vote_${type}_remove_${Date.now()}_${boxNumber}`;
    const voteData = {
      boxNumber: boxNumber+'',
      id: voteId,
      userId: user.uid,
      userEmail: user.email || '',
      type,
      timestamp: Timestamp.now(),
      region: selectedLocation.region,
      city: selectedLocation.city,
      metadata: {
        userAgent: browserInfo.userAgent,
        browser: browserInfo.browser,
        platform: browserInfo.platform,
        createdBy: user.displayName || user.email || user.uid
      }
    };

    try {
      // Update Redux store immediately for UI responsiveness
      if (type === 'positive') dispatch(decrementPositive());
      if (type === 'negative') dispatch(decrementNegative());
      if (type === 'invalid') dispatch(decrementInvalid());

      await saveDecrementVote(voteData);
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
          
          <Box sx={{ mb: 3 }}>
            <TextField
              type="number"
              label="Numri i Kutisë"
              fullWidth
              value={boxNumber}
              onChange={(e) => {
                const val = e.target.value;
                setBoxNumber(val === '' ? '' : Number(val));
              }}
              InputProps={{
                inputProps: { min: 1 }
              }}
              required
              error={boxNumber === ''}
              helperText={boxNumber === '' ? 'Ju lutem vendosni numrin e kutisë' : ''}
            />
          </Box>

          {selectedLocation?.region && selectedLocation.city ? (
            <>
              <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  Vendndodhja e Zgjedhur:
                </Typography>
                <Typography>Rajoni: {selectedLocation.region}</Typography>
                <Typography>KZAZ - Qyteti: {selectedLocation.city}</Typography>
              </Paper>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
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
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ my: 2 }}>
              Ju lutem zgjidhni një vendndodhje për të filluar numërimin
            </Alert>
          )}
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
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
          </Box>

          {/* Decrease Buttons */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
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
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VoteCounter;
