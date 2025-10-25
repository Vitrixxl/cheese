import { LucideCrown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "../ui/sidebar";
import GameSidebar from "./game-sidebar";
import FriendSidebar from "./friend-sidebar";
import { SidebarUser } from "./sidebar-user";
import { auth } from "@/lib/auth";
import GroupSidebar from "./group-sidebar";

export default function AppSidebar() {
  const { data: sessionData } = auth.useSession();
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
        {sessionData && (
          <>
            <GameSidebar />
            <FriendSidebar />
            <GroupSidebar />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
