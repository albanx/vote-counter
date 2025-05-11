import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { auth } from '../firebaseConfig';
import { Unsubscribe } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';
import { subscribeToGlobalCounts, subscribeToAllRegionCounts, subscribeToCityLevelCounts } from '../lib/firebase';
import locationsData from '../data/kzazv2.json';

interface VoteCount {
  positive: number;
  negative: number;
  invalid: number;
}

type SortColumn = 'region' | 'positive' | 'negative' | 'invalid' | 'total';
type SortDirection = 'asc' | 'desc';

// Base64 encoded authorized emails array
const ENCODED_EMAILS = 'WyJhcmxpbmRfcW9yaTExQHlhaG9vLmNvbSIsImFsYmFucGlyYUB5bWFpbC5jb20iLCJhbGJhbnhAZ21haWwuY29tIiwiYWxnZXJ0QHByb3Rvbm1haWwuY29tIiwiaXJkaWlzbWFpbGkxMUBwcm90b25tYWlsLmNvbSIsInBycm9uaWRhbmllbDE2QGdtYWlsLmNvbSJd';

// Decode the base64 string and parse JSON to get the array
const getAuthorizedEmails = (): string[] => {
  try {
    const decoded = atob(ENCODED_EMAILS);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding authorized emails:', error);
    return [];
  }
};

interface CityVoteCount extends VoteCount {
  city: string;
}

interface RegionRowProps {
  region: string;
  stats: VoteCount & { total: number };
  cityVotes: { [city: string]: VoteCount };
}

const RegionRow = ({ region, stats, cityVotes }: RegionRowProps) => {
  const [open, setOpen] = useState(false);
  const cityData = locationsData.find(loc => loc.name === region)?.cities || [];

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          {region}
        </TableCell>
        <TableCell align="right">{stats.positive}</TableCell>
        <TableCell align="right">{stats.negative}</TableCell>
        <TableCell align="right"><strong>{stats.total}</strong></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>KZAZ</TableCell>
                    <TableCell align="right">Vota të Vlefshme</TableCell>
                    <TableCell align="right">Vota të Pavlefshme</TableCell>
                    <TableCell align="right">Totali</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cityData.map((city) => {
                    const cityStats = cityVotes[city] || { positive: 0, negative: 0};
                    const total = cityStats.positive + cityStats.negative;
                    return (
                      <TableRow key={city}>
                        <TableCell component="th" scope="row">{city}</TableCell>
                        <TableCell align="right">{cityStats.positive}</TableCell>
                        <TableCell align="right">{cityStats.negative}</TableCell>
                        <TableCell align="right"><strong>{total}</strong></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Dashboard = () => {
  const [regionStats, setRegionStats] = useState<{ [region: string]: VoteCount }>({});
  const [cityVotes, setCityVotes] = useState<{ [city: string]: VoteCount }>({});
  const [globalStats, setGlobalStats] = useState<VoteCount>({ positive: 0, negative: 0, invalid: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<SortColumn>('region');
  const [order, setOrder] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const getSortedData = () => {
    return locationsData.map((location) => {
      const stats = regionStats[location.name] || {
        positive: 0,
        negative: 0,
        invalid: 0
      };
      const total = stats.positive + stats.negative + stats.invalid;
      return {
        region: location.name,
        ...stats,
        total
      };
    }).sort((a, b) => {
      const multiplier = order === 'asc' ? 1 : -1;
      
      if (orderBy === 'region') {
        return multiplier * a.region.localeCompare(b.region);
      }
      
      return multiplier * (a[orderBy] - b[orderBy]);
    });
  };

  // Get current user and check authorization
  const user = auth.currentUser;
  const isAuthorized = !!user && getAuthorizedEmails().includes(user.email || '');

  useEffect(() => {
    if (!isAuthorized) return;
    setLoading(true);

    const subscriptions: Unsubscribe[] = [];

    // Subscribe to global counts
    subscriptions.push(subscribeToGlobalCounts((counts) => {
      setGlobalStats(counts);
      setLastUpdate(new Date());
    }));

    // Subscribe to region counts
    subscriptions.push(subscribeToAllRegionCounts((counts) => {
      setRegionStats(counts);
      setLastUpdate(new Date());
    }));

    // Subscribe to city-level counts for each region
    locationsData.forEach((location) => {
      subscriptions.push(subscribeToCityLevelCounts(location.name, (counts) => {
        setCityVotes(prev => ({
          ...prev,
          ...counts
        }));
      }));
    });

    setLoading(false);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h5" color="error">
            Ndal - Ju nuk jeni i autorizuar për të parë këtë faqe
          </Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // We'll use the global stats from Firestore for the totals
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Përditësimi i fundit: {lastUpdate?.toLocaleString('sq-AL')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <img
            src="/levizjabashke.svg"
            alt="Levizja Bashke"
            style={{ height: '40px', marginRight: '1rem' }}
          />
          <Typography variant="h4" component="h1">
            Paneli i Numërimit të Votave
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3,
          mb: 4 
        }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <TrendingUp sx={{ fontSize: 40 }} />
            <Typography variant="h6">Vota të Vlefshme</Typography>
            <Typography variant="h3">{globalStats.positive}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
            <TrendingDown sx={{ fontSize: 40 }} />
            <Typography variant="h6">Vota të Pavlefshme</Typography>
            <Typography variant="h3">{globalStats.negative}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Warning sx={{ fontSize: 40 }} />
            <Typography variant="h6">Totali</Typography>
            <Typography variant="h3">{globalStats.negative+globalStats.positive}</Typography>
          </Paper>
        </Box>

        <Paper sx={{ mt: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'region'}
                      direction={order}
                      onClick={() => handleSort('region')}
                    >
                      <strong>Rajoni</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'positive'}
                      direction={order}
                      onClick={() => handleSort('positive')}
                    >
                      <strong>Vota të Vlefshme</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'negative'}
                      direction={order}
                      onClick={() => handleSort('negative')}
                    >
                      <strong>Vota të Pavlefshme</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'total'}
                      direction={order}
                      onClick={() => handleSort('total')}
                    >
                      <strong>Totali</strong>
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSortedData().map((row) => (
                  <RegionRow
                    key={row.region}
                    region={row.region}
                    stats={row}
                    cityVotes={cityVotes}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;