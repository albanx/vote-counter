import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { incrementPositive, incrementNegative, incrementInvalid } from '../store/votesSlice';
import { auth } from '../firebaseConfig';
import { useEffect, useState, useCallback } from 'react';
import { initDB, saveVoteLocally, getPendingVotes, markVoteAsSynced } from '../utils/indexedDB';
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
  CloudOff,
} from '@mui/icons-material';

const VoteCounter = () => {
  const user = auth.currentUser;
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    region: string;
    city: string;
    kzaz: string;
  } | null>(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [currentVoteId, setCurrentVoteId] = useState('');

  const positiveVotes = useSelector((state: RootState) => (state.votes as any).positive);
  const negativeVotes = useSelector((state: RootState) => (state.votes as any).negative);
  const invalidVotes = useSelector((state: RootState) => (state.votes as any).invalid);

  useEffect(() => {
    initDB();
    window.addEventListener('online', syncVotes);
    window.addEventListener('offline', () => setIsOnline(false));
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', syncVotes);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const syncVotes = async () => {
    setIsOnline(true);
    const pendingVotes = await getPendingVotes();
    
    for (const vote of pendingVotes) {
      try {
        // In a real app, this would send to Firebase
        console.log('Syncing vote:', vote);
        
        // Mark as synced in IndexedDB
        await markVoteAsSynced(vote.id);
      } catch (error) {
        console.error('Failed to sync vote:', error);
      }
    }
  };

  const handleVote = async (type: 'positive' | 'negative' | 'invalid') => {
    if (!user || !selectedLocation) return;

    const voteId = `vote_${Date.now()}`;
    const voteData = {
      id: voteId,
      userId: user.uid,
      type,
      timestamp: Date.now(),
      region: selectedLocation.region,
      city: selectedLocation.city,
      kzaz: selectedLocation.kzaz,
    };

    if (isOnline) {
      // In a real app, this would send to Firebase
      console.log('Sending vote to server:', voteData);
    } else {
      // Store locally when offline
      await saveVoteLocally(voteData);
    }

    // Update Redux store
    if (type === 'positive') dispatch(incrementPositive());
    if (type === 'negative') dispatch(incrementNegative());
    if (type === 'invalid') {
      dispatch(incrementInvalid());
      // Open dispute dialog for invalid votes
      setCurrentVoteId(voteId);
      setDisputeDialogOpen(true);
    }
  };

  const handleOpenDisputeDialog = (voteId: string) => {
    setCurrentVoteId(voteId);
    setDisputeDialogOpen(true);
  };

  const handleCloseDisputeDialog = () => {
    setDisputeDialogOpen(false);
  };

  const handleLocationSelect = useCallback((location: { region: string; city: string; kzaz: string }) => {
    setSelectedLocation(location);
  }, []);

  return (
    <Container maxWidth="md">
      <DisputeDialog
        open={disputeDialogOpen}
        onClose={handleCloseDisputeDialog}
        voteId={currentVoteId}
      />
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Numëruesi i Votave
            {!isOnline && (
              <Alert
                icon={<CloudOff />}
                severity="warning"
                sx={{ mt: 2 }}
              >
                Ju jeni offline - votat do të sinkronizohen kur të ktheheni online
              </Alert>
            )}
          </Typography>

          <Box sx={{ my: 4 }}>
            <LocationSelector onLocationSelect={handleLocationSelect} />
          </Box>
          
          {selectedLocation ? (
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
            mt: 4 
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
        </Paper>
      </Box>
    </Container>
  );
};

export default VoteCounter;