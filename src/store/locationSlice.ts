import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  region: string;
  city: string;
  kzaz: string;
}

const initialState: LocationState = {
  region: localStorage.getItem('selectedRegion') || '',
  city: localStorage.getItem('selectedCity') || '',
  kzaz: localStorage.getItem('selectedKzaz') || '',
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
      state.city = '';
      state.kzaz = '';
      localStorage.setItem('selectedRegion', action.payload);
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
      state.kzaz = '';
      localStorage.setItem('selectedCity', action.payload);
    },
    setKzaz: (state, action: PayloadAction<string>) => {
      state.kzaz = action.payload;
      localStorage.setItem('selectedKzaz', action.payload);
    },
  },
});

export const { setRegion, setCity, setKzaz } = locationSlice.actions;
export default locationSlice.reducer;
