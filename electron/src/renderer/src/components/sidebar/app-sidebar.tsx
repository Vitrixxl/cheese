import {
  LucideChartNetwork,
  LucideCrown,
  LucideGraduationCap,
  LucidePuzzle,
  LucideTrophy,
  LucideUsers
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton
} from '../ui/sidebar'
import GameSidebar from './game-sidebar'
import { SidebarUser } from './sidebar-user'
import { auth } from '@/lib/auth'
import { Link } from 'react-router'

const links = [
  {
    icon: <LucideTrophy className="text-yellow-500" />,
    label: 'Tournaments',
    to: '/tournaments'
  },
  {
    icon: <LucidePuzzle className="text-green-500" />,
    label: 'Puzzles',
    to: '/puzzles'
  },
  {
    icon: <LucideChartNetwork className="text-violet-500" />,
    label: 'Analysis',
    to: '/games'
  },
  {
    icon: <LucideGraduationCap className="text-blue-500" />,
    label: 'Lessons',
    to: '/lessons'
  },
  {
    icon: <LucideUsers />,
    label: 'Social',
    to: 'social'
  }
]

export default function AppSidebar() {
  const { data: sessionData } = auth.useSession()
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton className="items-center" asChild>
            <Link to="/">
              <LucideCrown />
              <span className="font-semibold">Chessinator</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="space-y-0">
        {sessionData && (
          <>
            <GameSidebar />
            <SidebarGroup className="gap-2">
              {links.map(({ to, icon, label }) => (
                <SidebarMenu key={to}>
                  <SidebarMenuButton asChild className="relative gap-4">
                    <Link to={to}>
                      {icon}
                      {label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenu>
              ))}
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}
