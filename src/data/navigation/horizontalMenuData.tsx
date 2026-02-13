// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
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

export default horizontalMenuData
