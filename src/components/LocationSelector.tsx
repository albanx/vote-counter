import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import locationsData from '../data/kzazv2.json';
import { RootState } from '../store';
import { setRegion, setCity, setBoxNumber } from '../store/locationSlice';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  TextField
} from '@mui/material';

const LocationSelector = () => {
  const dispatch = useDispatch();
  const { region, city, boxNumber } = useSelector((state: RootState) => state.location);
  const selectedRegion = locationsData.find(r => r.name === region);
  const cities = selectedRegion?.cities || [];

  useEffect(() => {
    // Load saved selections from localStorage on component mount
    const savedRegionName = localStorage.getItem('selectedRegion');
    if (savedRegionName) {
      const region = locationsData.find(r => r.name === savedRegionName);
      if (region) {
        dispatch(setRegion(region.name));
        
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity && region.cities.includes(savedCity)) {
          dispatch(setCity(savedCity));
        }
      }
    }
  }, [dispatch]);

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    dispatch(setRegion(event.target.value));
  };

  const handleCityChange = (event: SelectChangeEvent<string>) => {
    dispatch(setCity(event.target.value));
  };

  const handleBoxNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Value is already a string from TextField
    dispatch(setBoxNumber(event.target.value));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="region-label">Qarku</InputLabel>
        <Select
          labelId="region-label"
          value={region}
          onChange={handleRegionChange}
          label="Rajoni"
        >
          <MenuItem value="">
            <em>Zgjidhni Qarkun</em>
          </MenuItem>
          {locationsData.map(region => (
            <MenuItem key={region.name} value={region.name}>
              {region.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!region}>
        <InputLabel id="city-label">KZAZ - Qyteti</InputLabel>
        <Select
          labelId="city-label"
          value={city}
          onChange={handleCityChange}
          label="Qyteti"
        >
          <MenuItem value="">
            <em>Zgjidhni Qytetin</em>
          </MenuItem>
          {cities.map(city => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth disabled={!region}>
        <TextField
          type="number"
          label="Numri i Kutisë"
          fullWidth
          value={boxNumber}
          onChange={handleBoxNumberChange}
          InputProps={{
            inputProps: { min: 1 }
          }}
          required
          error={boxNumber === ''}
          helperText={boxNumber === '' ? 'Ju lutem vendosni numrin e kutisë' : ''}
        />
      </FormControl>
    </Box>
  );
};

export default LocationSelector;
