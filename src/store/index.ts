import { configureStore } from '@reduxjs/toolkit';
import votesReducer from './votesSlice';
import locationReducer from './locationSlice';

const store = configureStore({
  reducer: {
    votes: votesReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
