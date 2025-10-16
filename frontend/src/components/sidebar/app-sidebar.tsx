import { LucideCrown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "../ui/sidebar";
import GameSidebar from "./game-sidebar";

export default function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton className="items-center">
            <LucideCrown />
            <span className="font-semibold">Chessinator</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <GameSidebar />
      </SidebarContent>
    </Sidebar>
  );
}
