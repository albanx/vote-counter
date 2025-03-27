import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Dispute {
  id: string;
  voteId: string;
  comment: string;
  status: 'open' | 'under_review' | 'resolved';
  timestamp: number;
}

interface VotesState {
  positive: number;
  negative: number;
  invalid: number;
  disputes: Dispute[];
}

const initialState: VotesState = {
  positive: 0,
  negative: 0,
  invalid: 0,
  disputes: [],
};

const votesSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    incrementPositive: (state) => {
      state.positive += 1;
    },
    incrementNegative: (state) => {
      state.negative += 1;
    },
    incrementInvalid: (state) => {
      state.invalid += 1;
    },
    addDispute: (state, action: PayloadAction<Dispute>) => {
      state.disputes.push(action.payload);
    },
    updateDisputeStatus: (state, action: PayloadAction<{ id: string; status: 'open' | 'under_review' | 'resolved' }>) => {
      const dispute = state.disputes.find(d => d.id === action.payload.id);
      if (dispute) {
        dispute.status = action.payload.status;
      }
    },
    setVotes: (state, action: PayloadAction<VotesState>) => {
      state.positive = action.payload.positive;
      state.negative = action.payload.negative;
      state.invalid = action.payload.invalid;
      state.disputes = action.payload.disputes;
    },
  },
});

export const {
  incrementPositive,
  incrementNegative,
  incrementInvalid,
  addDispute,
  updateDisputeStatus,
  setVotes
} = votesSlice.actions;
export default votesSlice.reducer;