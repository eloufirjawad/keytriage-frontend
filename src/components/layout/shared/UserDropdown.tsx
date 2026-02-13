'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import { useRouter } from 'next/navigation'

import { styled } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'

import { useSettings } from '@core/hooks/useSettings'

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

type TenantItem = {
  id: string
  name: string
  slug: string
  status: string
}

type SessionPayload = {
  authenticated: boolean
  user?: {
    id: string
    email: string
  }
  tenant?: TenantItem
  tenants?: TenantItem[]
}

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<SessionPayload>({ authenticated: false })

  const anchorRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { settings } = useSettings()

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      const payload = (await response.json().catch(() => ({}))) as SessionPayload

      setSession(payload)
    }

    loadSession().catch(() => {
      setSession({ authenticated: false })
    })
  }, [])

  const handleDropdownOpen = () => {
    setOpen(current => !current)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    setLoading(true)

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/login')
      router.refresh()
      setLoading(false)
    }
  }

  const handleSwitchTenant = async (tenantId: string) => {
    if (!tenantId || loading) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId })
      })

      if (!response.ok) {
        throw new Error('Workspace switch failed.')
      }

      const payload = (await response.json().catch(() => ({}))) as {
        user?: SessionPayload['user']
        tenant?: TenantItem
        tenants?: TenantItem[]
      }

      setSession({
        authenticated: true,
        user: payload.user || session.user,
        tenant: payload.tenant || session.tenant,
        tenants: payload.tenants || session.tenants || []
      })

      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const activeTenantId = session.tenant?.id || ''
  const switchableTenants = (session.tenants || []).filter(tenant => tenant.id !== activeTenantId)

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt='User avatar'
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[280px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-start plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar alt='User avatar' src='/images/avatars/1.png' />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {session.user?.email || 'Signed-in user'}
                      </Typography>
                      <Typography variant='caption'>Workspace: {session.tenant?.name || '-'}</Typography>
                    </div>
                  </div>

                  <Divider className='mlb-1' />

                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/app/settings')}>
                    <i className='tabler-settings' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>

                  {switchableTenants.map(tenant => (
                    <MenuItem
                      key={tenant.id}
                      className='mli-2 gap-3'
                      disabled={loading}
                      onClick={() => handleSwitchTenant(tenant.id)}
                    >
                      <i className='tabler-building-community' />
                      <Typography color='text.primary'>Switch to {tenant.name}</Typography>
                    </MenuItem>
                  ))}

                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      disabled={loading}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {loading ? 'Working...' : 'Logout'}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
