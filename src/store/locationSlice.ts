import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  region: string;
  city: string;
  kzaz: string;
}

const getInitialState = (): LocationState => {
  if (typeof window === 'undefined') {
    return {
      region: '',
      city: '',
      kzaz: ''
    };
  }
  
  return {
    region: localStorage.getItem('selectedRegion') || '',
    city: localStorage.getItem('selectedCity') || '',
    kzaz: localStorage.getItem('selectedKzaz') || '',
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
      state.kzaz = '';
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedRegion', action.payload);
      }
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
      state.kzaz = '';
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCity', action.payload);
      }
    },
    setKzaz: (state, action: PayloadAction<string>) => {
      state.kzaz = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedKzaz', action.payload);
      }
    },
  },
});

export const { setRegion, setCity, setKzaz } = locationSlice.actions;
export default locationSlice.reducer;
