import {
  LucideChartNetwork,
  LucideCrown,
  LucideGraduationCap,
  LucidePuzzle,
  LucideTrophy,
  LucideUsers,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from '../ui/sidebar'
import { SidebarUser } from './sidebar-user'
import { auth } from '@/lib/auth'
import { Link } from 'react-router'
import { ChallengeSidebar } from './challenge-sidebar'
import { GameSelector } from '../game-selector'

const links = [
  {
    icon: <LucideTrophy className="text-yellow-500" />,
    label: 'Tournaments',
    to: '/tournaments',
  },
  {
    icon: <LucidePuzzle className="text-green-500" />,
    label: 'Puzzles',
    to: '/puzzles',
  },
  {
    icon: <LucideChartNetwork className="text-violet-500" />,
    label: 'Analysis',
    to: '/games',
  },
  {
    icon: <LucideGraduationCap className="text-blue-500" />,
    label: 'Lessons',
    to: '/lessons',
  },
  {
    icon: <LucideUsers />,
    label: 'Social',
    to: 'social',
  },
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
            <SidebarGroup>
              <SidebarMenu className="flex flex-col gap-4">
                <GameSelector />
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="gap-2">
              <ChallengeSidebar />
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
