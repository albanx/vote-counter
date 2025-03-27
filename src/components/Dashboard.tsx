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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';
import locationsData from '../data/locations.json';

interface VoteCount {
  positive: number;
  negative: number;
  invalid: number;
}

interface RegionStats {
  [key: string]: VoteCount;
}

const Dashboard = () => {
  const [regionStats, setRegionStats] = useState<RegionStats>({});
  const [loading, setLoading] = useState(false);
  
  const totalVotes = useSelector((state: RootState) => ({
    positive: (state.votes as any).positive,
    negative: (state.votes as any).negative,
    invalid: (state.votes as any).invalid,
    disputes: (state.votes as any).disputes || [],
  }));

  useEffect(() => {
    // In a real app, this would fetch from Firebase
    // For now, we'll generate some sample data based on our locations
    const stats: RegionStats = {};
    
    locationsData.regions.forEach(region => {
      stats[region.name] = {
        positive: Math.floor(Math.random() * 1000),
        negative: Math.floor(Math.random() * 500),
        invalid: Math.floor(Math.random() * 100),
      };
    });
    
    setRegionStats(stats);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const totalByType = {
    positive: Object.values(regionStats).reduce((sum, region) => sum + region.positive, 0),
    negative: Object.values(regionStats).reduce((sum, region) => sum + region.negative, 0),
    invalid: Object.values(regionStats).reduce((sum, region) => sum + region.invalid, 0),
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Paneli i Numërimit të Votave
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3,
          mb: 4 
        }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <TrendingUp sx={{ fontSize: 40 }} />
            <Typography variant="h6">Vota të Vlefshme</Typography>
            <Typography variant="h3">{totalByType.positive}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
            <TrendingDown sx={{ fontSize: 40 }} />
            <Typography variant="h6">Vota të Pavlefshme</Typography>
            <Typography variant="h3">{totalByType.negative}</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Warning sx={{ fontSize: 40 }} />
            <Typography variant="h6">Vota të Kontestuara</Typography>
            <Typography variant="h3">{totalByType.invalid}</Typography>
          </Paper>
        </Box>

        <Paper sx={{ mt: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Rajoni</strong></TableCell>
                  <TableCell align="right"><strong>Vota të Vlefshme</strong></TableCell>
                  <TableCell align="right"><strong>Vota të Pavlefshme</strong></TableCell>
                  <TableCell align="right"><strong>Vota të Kontestuara</strong></TableCell>
                  <TableCell align="right"><strong>Totali</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(regionStats).map(([region, stats]) => {
                  const total = stats.positive + stats.negative + stats.invalid;
                  return (
                    <TableRow key={region}>
                      <TableCell component="th" scope="row">{region}</TableCell>
                      <TableCell align="right">{stats.positive}</TableCell>
                      <TableCell align="right">{stats.negative}</TableCell>
                      <TableCell align="right">{stats.invalid}</TableCell>
                      <TableCell align="right"><strong>{total}</strong></TableCell>
                    </TableRow>
                  );
                })}
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