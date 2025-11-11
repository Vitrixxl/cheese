import { auth } from "@/lib/auth";
import { SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { UserAvatar } from "../user-avatar";

export const SidebarUser = () => {
  const { data } = auth.useSession();
  return (
    <SidebarMenu>
      {data ? (
        <SidebarMenuButton
          className="text-muted-foreground hover:text-foreground"
          variant="outline"
        >
          <UserAvatar url={data.user.image} name={data.user.name} size="sm" />
          <span className="line-clamp-1 text-ellipsis">{data.user.name}</span>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          variant={"outline"}
          onClick={() =>
            auth.signIn.social({
              provider: "google",
              callbackURL: "http://localhost:5173",
            })
          }
          className="justify-center"
        >
          Connect with google
        </SidebarMenuButton>
      )}
    </SidebarMenu>
  );
};
