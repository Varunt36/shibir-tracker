import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, Card, CardContent, CardActionArea,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, CircularProgress, Chip, IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { getShibirs, createShibir, updateShibir } from '../api/shibirs'

interface Shibir {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  fee: number
}

interface ShibirForm {
  title: string
  start_date: string
  end_date: string
  fee: string
}

const EMPTY_FORM: ShibirForm = { title: '', start_date: '', end_date: '', fee: '' }

export default function Shibirs() {
  const [shibirs, setShibirs] = useState<Shibir[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ShibirForm>(EMPTY_FORM)
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    const data = await getShibirs()
    setShibirs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(s: Shibir) {
    setEditingId(s.id)
    setForm({
      title: s.title,
      start_date: s.start_date ?? '',
      end_date: s.end_date ?? '',
      fee: String(s.fee),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.fee) return
    const payload = {
      title: form.title,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      fee: Number(form.fee),
    }
    if (editingId) {
      await updateShibir(editingId, payload)
    } else {
      await createShibir(payload)
    }
    setDialogOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    load()
  }

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Shibirs</Typography>
        <Button variant="contained" onClick={openCreate}>Create Shibir</Button>
      </Stack>
      <Grid container spacing={2}>
        {shibirs.map(s => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.id}>
            <Card sx={{ position: 'relative' }}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); openEdit(s) }}
                sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
                aria-label="Edit shibir"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <CardActionArea onClick={() => navigate(`/shibirs/${s.id}`)}>
                <CardContent>
                  <Typography variant="h6" sx={{ pr: 4 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.start_date} → {s.end_date ?? '?'}
                  </Typography>
                  <Chip label={`€${s.fee}`} size="small" sx={{ mt: 1 }} color="primary" variant="outlined" />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Shibir' : 'Create Shibir'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Start Date" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="End Date" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Fee (€) *" type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
