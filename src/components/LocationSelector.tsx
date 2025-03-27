import { useState, useEffect } from 'react';
import locationsData from '../data/locations.json';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';

interface Location {
  id: string;
  name: string;
  parentId?: string;
  type: 'region' | 'city' | 'kzaz';
}

interface LocationSelectorProps {
  onLocationSelect: (location: { region: string; city: string; kzaz: string }) => void;
}

const LocationSelector = ({ onLocationSelect }: LocationSelectorProps) => {
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [kzazs, setKzazs] = useState<Location[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedKzaz, setSelectedKzaz] = useState('');

  useEffect(() => {
    // Load regions from the static data
    setRegions(locationsData.regions as Location[]);
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      // Filter cities based on selected region
      const filteredCities = locationsData.cities.filter(
        city => city.parentId === selectedRegion
      );
      setCities(filteredCities as Location[]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedCity) {
      // Filter KZAZs based on selected city
      const filteredKzazs = locationsData.kzaz.filter(
        kzaz => kzaz.parentId === selectedCity
      );
      setKzazs(filteredKzazs as Location[]);
    }
  }, [selectedCity]);

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const regionId = event.target.value;
    setSelectedRegion(regionId);
    setSelectedCity('');
    setSelectedKzaz('');
  };

  const handleCityChange = (event: SelectChangeEvent<string>) => {
    const cityId = event.target.value;
    setSelectedCity(cityId);
    setSelectedKzaz('');
  };

  const handleKzazChange = (event: SelectChangeEvent<string>) => {
    const kzazId = event.target.value;
    setSelectedKzaz(kzazId);
    const region = regions.find(r => r.id === selectedRegion)?.name || '';
    const city = cities.find(c => c.id === selectedCity)?.name || '';
    const kzaz = kzazs.find(k => k.id === kzazId)?.name || '';
    onLocationSelect({ region, city, kzaz });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="region-label">Rajoni</InputLabel>
        <Select
          labelId="region-label"
          value={selectedRegion}
          onChange={handleRegionChange}
          label="Rajoni"
        >
          <MenuItem value="">
            <em>Zgjidhni Rajonin</em>
          </MenuItem>
          {regions.map(region => (
            <MenuItem key={region.id} value={region.id}>
              {region.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedRegion}>
        <InputLabel id="city-label">Qyteti</InputLabel>
        <Select
          labelId="city-label"
          value={selectedCity}
          onChange={handleCityChange}
          label="Qyteti"
        >
          <MenuItem value="">
            <em>Zgjidhni Qytetin</em>
          </MenuItem>
          {cities.map(city => (
            <MenuItem key={city.id} value={city.id}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedCity}>
        <InputLabel id="kzaz-label">KZAZ</InputLabel>
        <Select
          labelId="kzaz-label"
          value={selectedKzaz}
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