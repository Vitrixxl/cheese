import {
  LucideLoaderCircle,
  LucidePlus,
  LucideSearch,
  LucideUserPlus,
  LucideUsers,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useWindows } from "../window";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import React from "react";
import { useFriends, useSearchFriend } from "@/hooks/use-friends";
import { Button } from "../ui/button";
import { UserAvatar } from "../user-avatar";

export function AddFriends() {
  const [query, setQuery] = React.useState("");
  const { data, error, isLoading } = useSearchFriend(query);
  return (
    <div className="flex flex-col gap-2 h-full p-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search the name of your friend"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <InputGroupAddon align="inline-end">
          <LucideSearch />
        </InputGroupAddon>
      </InputGroup>
      {error && !isLoading && (
        <div className="mx-auto my-auto">
          <div className="p-2 border bg-destructive rounded-lg">
            {error.message}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="mx-auto my-auto">
          <LucideLoaderCircle className="animate-spin size-8" />
        </div>
      )}
      {data && (
        <div className="flex flex-col gap-2">
          {data.map((u) => (
            <div
              className="flex gap-2 items-center group/button w-full "
              key={u.id}
            >
              <Button
                className="justify-start px-4 flex-1"
                variant={"ghost"}
                asChild
              >
                <div>
                  <UserAvatar url={u.image} name={u.name} size="sm" />
                  <span className="line-clamp-1 text-ellipsis">{u.name}</span>
                  <span>({u.elo})</span>
                </div>
              </Button>
              <Button
                className="group-hover/button:flex hidden"
                size="icon"
                variant="outline"
              >
                <LucidePlus />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className=""></div>
    </div>
  );
}

export default function FriendSidebar() {
  const { addWindow } = useWindows();
  const { data, error, isLoading } = useFriends();
  return (
    <SidebarGroup>
      <div className="flex justify-between items-center mb-4">
        <SidebarGroupLabel>Friends</SidebarGroupLabel>
        <Button
          size="icon-sm"
          onClick={() =>
            addWindow({
              id: "add-friend",
              children: <AddFriends />,
              initialHeight: 500,
              initialWidth: 500,
              title: "Search for friends",
              icon: <LucideUsers />,
            })
          }
        >
          <LucideUserPlus />
        </Button>
      </div>

      <SidebarMenu className="flex gap-2 flex-col mb-2">
        {isLoading && (
          <LucideLoaderCircle className="animate-spin mx-auto text-muted-foreground" />
        )}
        {error && !isLoading && (
          <div className="rounded-lg bg-destructive border text-center">
            {error.message}
          </div>
        )}
        {data && data.length > 0 ? (
          data.map((u, i) => <div key={i}>{u.name}</div>)
        ) : (
          <p className="text-xs text-muted-foreground mx-auto">
            You don't have friend ahahah
          </p>
        )}
      </SidebarMenu>
      <SidebarMenu>
        <SidebarMenuItem></SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
