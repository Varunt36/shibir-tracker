import { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { getDashboardStats } from '../api/dashboard'

interface Stats {
  totalYouth: number
  nextShibir: { title: string; start_date: string } | null
  totalCollected: number
  totalPending: number
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon}
          <Typography color="text.secondary" variant="body2">{label}</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
        {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <CircularProgress />
  if (!stats) return null

  return (
    <Box>
      <Typography variant="h5" mb={3}>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<PeopleIcon color="primary" />}
            label="Total Youth"
            value={stats.totalYouth}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<EventIcon color="secondary" />}
            label="Next Shibir"
            value={stats.nextShibir?.title ?? '—'}
            sub={stats.nextShibir?.start_date ?? 'No upcoming shibirs'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<AttachMoneyIcon color="success" />}
            label="Finance Summary"
            value={`€${stats.totalCollected.toLocaleString()}`}
            sub={`€${stats.totalPending.toLocaleString()} pending`}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
