import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WindowsProvider } from "@/components/window";
import QueryProvider from "@/providers/query-provider";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <QueryProvider>
      <WindowsProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </WindowsProvider>
    </QueryProvider>
  );
}
