// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: 'tabler-layout-dashboard'
  },
  {
    label: 'Tickets',
    href: '/app/tickets',
    icon: 'tabler-ticket'
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: 'tabler-settings'
  }
]

export default verticalMenuData
