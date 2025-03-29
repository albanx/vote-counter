import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
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
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { auth } from '../firebaseConfig';
import { subscribeToGlobalCounts, subscribeToAllRegionCounts } from '../lib/firebase';
import locationsData from '../data/locations.json';
import { Unsubscribe } from 'firebase/firestore';

interface VoteCount {
  positive: number;
  negative: number;
  invalid: number;
}

interface RegionStats {
  [key: string]: VoteCount;
}

type SortColumn = 'region' | 'positive' | 'negative' | 'invalid' | 'total';
type SortDirection = 'asc' | 'desc';

const Dashboard = () => {
  const [regionStats, setRegionStats] = useState<{ [region: string]: VoteCount }>({});
  const [globalStats, setGlobalStats] = useState<VoteCount>({ positive: 0, negative: 0, invalid: 0 });
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

  const totalVotes = useSelector((state: RootState) => ({
    positive: (state.votes as any).positive,
    negative: (state.votes as any).negative,
    invalid: (state.votes as any).invalid,
    disputes: (state.votes as any).disputes || [],
  }));

  useEffect(() => {
    setLoading(true);

    // Subscribe to global and region counts
    const globalUnsubscribe = subscribeToGlobalCounts((counts) => {
      setGlobalStats(counts);
    });

    const regionsUnsubscribe = subscribeToAllRegionCounts((counts) => {
      setRegionStats(counts);
      setLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      globalUnsubscribe();
      regionsUnsubscribe();
    };
  }, []);

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

        <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
          <Toolbar>
            <Button href="/" color="inherit">
              Numërimi
            </Button>
            <Button href="/dashboard" color="inherit">
              Statistikat
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              color="inherit"
              onClick={() => auth.signOut()}
              startIcon={<LogoutIcon />}
            >
              Dil
            </Button>
          </Toolbar>
        </AppBar>

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
            <Typography variant="h6">Vota të Kontestuara</Typography>
            <Typography variant="h3">{globalStats.invalid}</Typography>
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
                      active={orderBy === 'invalid'}
                      direction={order}
                      onClick={() => handleSort('invalid')}
                    >
                      <strong>Vota të Kontestuara</strong>
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
                  <TableRow key={row.region}>
                    <TableCell component="th" scope="row">{row.region}</TableCell>
                    <TableCell align="right">{row.positive}</TableCell>
                    <TableCell align="right">{row.negative}</TableCell>
                    <TableCell align="right">{row.invalid}</TableCell>
                    <TableCell align="right"><strong>{row.total}</strong></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {totalVotes.disputes.length > 0 && (
          <Paper sx={{ mt: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="h6">Votat e Kontestuara</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Koha</strong></TableCell>
                    <TableCell><strong>Komenti</strong></TableCell>
                    <TableCell><strong>Statusi</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {totalVotes.disputes.map((dispute: any) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        {new Date(dispute.timestamp).toLocaleString('sq-AL')}
                      </TableCell>
                      <TableCell>{dispute.comment}</TableCell>
                      <TableCell>
                        {dispute.status === 'open' && 'Hapur'}
                        {dispute.status === 'under_review' && 'Në shqyrtim'}
                        {dispute.status === 'resolved' && 'Zgjidhur'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;