import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import locationsData from '../data/locations.json';
import kzazJsonData from '../data/kzaz.json';
import { RootState } from '../store';
import { setRegion, setCity, setKzaz } from '../store/locationSlice';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';

interface Location {
  name: string;
  country_code?: string;
  cities: string[];
}

interface Kzaz {
  id: string;
  name: string;
  parentId: string;
}

const kzazData: Kzaz[] = kzazJsonData as Kzaz[];

const LocationSelector = () => {
  const dispatch = useDispatch();
  const { region, city, kzaz } = useSelector((state: RootState) => state.location);
  const selectedRegion = locationsData.find(r => r.name === region);
  const cities = selectedRegion?.cities || [];
  const kzazs = kzazData;

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
          
          const savedKzaz = localStorage.getItem('selectedKzaz');
          if (savedKzaz) {
            dispatch(setKzaz(savedKzaz));
          }
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

  const handleKzazChange = (event: SelectChangeEvent<string>) => {
    dispatch(setKzaz(event.target.value));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="region-label">Rajoni</InputLabel>
        <Select
          labelId="region-label"
          value={region}
          onChange={handleRegionChange}
          label="Rajoni"
        >
          <MenuItem value="">
            <em>Zgjidhni Rajonin</em>
          </MenuItem>
          {locationsData.map(region => (
            <MenuItem key={region.name} value={region.name}>
              {region.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!region}>
        <InputLabel id="city-label">Qyteti</InputLabel>
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

      <FormControl fullWidth disabled={!city}>
        <InputLabel id="kzaz-label">KZAZ</InputLabel>
        <Select
          labelId="kzaz-label"
          value={kzaz}
          onChange={handleKzazChange}
          label="KZAZ"
        >
          <MenuItem value="">
            <em>Zgjidhni KZAZ</em>
          </MenuItem>
          {kzazs.map(kzaz => (
            <MenuItem key={kzaz.id} value={kzaz.id}>
              {kzaz.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LocationSelector;
