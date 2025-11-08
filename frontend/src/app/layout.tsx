import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WindowsProvider } from "@/components/window";
import useGameWs from "@/hooks/use-game-ws";
import useHubWs from "@/hooks/use-hub-ws";
import QueryProvider from "@/providers/query-provider";
import { Outlet } from "react-router";

export default function AppLayout() {
  useHubWs();
  useGameWs();
  return (
    <QueryProvider>
      <WindowsProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="max-h-full overflow-hidden">
            <div className="h-full max-h-full overflow-hidden p-4 flex-1 w-full">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </WindowsProvider>
    </QueryProvider>
  );
}
