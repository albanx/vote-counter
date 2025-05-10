import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  region: string;
  city: string;
  boxNumber: string;
}

const getInitialState = (): LocationState => {
  if (typeof window === 'undefined') {
    return {
      region: '',
      city: '',
      boxNumber: '',
    };
  }
  
  return {
    region: localStorage.getItem('selectedRegion') || '',
    city: localStorage.getItem('selectedCity') || '',
    boxNumber: localStorage.getItem('boxNumber') || '',
  };
};

const initialState: LocationState = getInitialState();

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
      state.city = '';
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedRegion', action.payload);
      }
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCity', action.payload);
      }
    },
    setBoxNumber: (state, action: PayloadAction<string>) => {
      state.boxNumber = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('boxNumber', action.payload);
      }
    },
  },
});

export const { setRegion, setCity, setBoxNumber } = locationSlice.actions;
export default locationSlice.reducer;
