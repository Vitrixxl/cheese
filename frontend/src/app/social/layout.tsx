import Protected from "@/components/protected";
import ChatSidebar from "./_components/chat-sidebar";
import { Outlet } from "react-router";

export default function SocialLayout() {
  return (
    <Protected>
      <div className="h-full flex gap-4">
        <ChatSidebar />
        <Outlet />
      </div>
    </Protected>
  );
}
