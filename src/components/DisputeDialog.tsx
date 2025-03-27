import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addDispute } from '../store/votesSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

interface DisputeDialogProps {
  open: boolean;
  onClose: () => void;
  voteId: string;
}

const DisputeDialog = ({ open, onClose, voteId }: DisputeDialogProps) => {
  const [comment, setComment] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = () => {
    if (!comment.trim()) return;

    dispatch(
      addDispute({
        id: `dispute_${Date.now()}`,
        voteId,
        comment,
        status: 'open',
        timestamp: Date.now(),
      })
    );

    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shtoni Kontestim</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Ju lutem shpjegoni arsyen e kontestimit të kësaj vote.
        </Typography>
        <TextField
          autoFocus
          label="Komenti"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Shpjegoni arsyen e kontestimit..."
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Anulo
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!comment.trim()}
        >
          Dërgo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisputeDialog;