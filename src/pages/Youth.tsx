import { useEffect, useState } from 'react'
import {
  Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, Stack
} from '@mui/material'
import Papa from 'papaparse'
import { getYouth, addYouth, updateYouth, deleteYouth, bulkInsertYouth } from '../api/youth'
import YouthTable from '../components/YouthTable'

interface Youth {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface YouthForm {
  name: string
  phone: string
  email: string
}

const EMPTY_FORM: YouthForm = { name: '', phone: '', email: '' }

export default function Youth() {
  const [youth, setYouth] = useState<Youth[]>([])
  const [filtered, setFiltered] = useState<Youth[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [form, setForm] = useState<YouthForm>(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Youth | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const data = await getYouth()
    setYouth(data)
    setFiltered(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(youth.filter(y =>
      y.name.toLowerCase().includes(q) ||
      (y.phone ?? '').includes(q) ||
      (y.email ?? '').toLowerCase().includes(q)
    ))
  }, [search, youth])

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setDialogOpen(true) }
  function openEdit(row: Youth) { setForm({ name: row.name, phone: row.phone ?? '', email: row.email ?? '' }); setEditId(row.id); setDialogOpen(true) }
  function openDelete(row: Youth) { setDeleteTarget(row); setDeleteDialogOpen(true) }

  async function handleSave() {
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }
    try {
      if (editId) await updateYouth(editId, form as unknown as Record<string, unknown>)
      else await addYouth(form as unknown as Record<string, unknown>)
      setDialogOpen(false)
      load()
    } catch (e) { setError((e as Error).message) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteYouth(deleteTarget.id)
    setDeleteDialogOpen(false)
    load()
  }

  function handleExportCSV() {
    const csv = Papa.unparse(filtered.map(({ name, phone, email }) => ({ name, phone, email })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'youth.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse<{ name: string; phone?: string; email?: string }>(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data }) => {
        const rows = data.map(r => ({ name: r.name, phone: r.phone ?? null, email: r.email ?? null })).filter(r => r.name)
        await bulkInsertYouth(rows)
        load()
      }
    })
    e.target.value = ''
  }

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Youth</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="outlined" component="label">
            Import CSV
            <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
          </Button>
          <Button variant="contained" onClick={openAdd}>Add Youth</Button>
        </Stack>
      </Stack>
      <TextField
        fullWidth placeholder="Search by name, phone, or email" value={search}
        onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }} size="small"
      />
      <YouthTable rows={filtered} onEdit={openEdit} onDelete={openDelete} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Youth' : 'Add Youth'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
        <DialogContent>This cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
