import AppSidebar from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import useGameWs from '@/hooks/use-game-ws'
import useHubWs from '@/hooks/use-hub-ws'
import QueryProvider from '@/providers/query-provider'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout() {
  useHubWs()
  useGameWs()

  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="max-h-full overflow-hidden">
          <div className="h-full max-h-full w-full flex-1 overflow-hidden p-4">
            <Toaster />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  )
}
