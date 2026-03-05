import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Divider
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import LogoutIcon from '@mui/icons-material/Logout'
import { supabase } from '../lib/supabase'
import { ReactNode } from 'react'

const DRAWER_WIDTH = 220

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Youth', path: '/youth', icon: <PeopleIcon /> },
  { label: 'Shibirs', path: '/shibirs', icon: <EventIcon /> },
]

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap>Shibir Management</Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
