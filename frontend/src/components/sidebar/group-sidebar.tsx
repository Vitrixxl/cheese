import { LucideLoaderCircle, LucidePlus, LucideUsers } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useWindows } from "../window";
import React from "react";
import { useGroups, useCreateGroup } from "@/hooks/use-groups";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export function CreateGroup() {
  const [name, setName] = React.useState("");
  const createGroup = useCreateGroup();
  const { closeWindow } = useWindows();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createGroup.mutate(
        { name: name.trim() },
        {
          onSuccess: () => {
            closeWindow("create-group");
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 ">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Input
            id="group-name"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoFocus
          />
        </div>
        <Button type="submit" disabled={!name.trim() || createGroup.isPending}>
          {createGroup.isPending ? (
            <>
              <LucideLoaderCircle className="animate-spin size-4 mr-2" />
              Creating...
            </>
          ) : (
            "Create Group"
          )}
        </Button>
        {createGroup.error && (
          <div className="p-2 border bg-destructive rounded-lg text-sm">
            {createGroup.error.message}
          </div>
        )}
      </form>
    </div>
  );
}

export default function GroupSidebar() {
  const { addWindow } = useWindows();
  const { data, error, isLoading } = useGroups();

  return (
    <SidebarGroup>
      <div className="flex justify-between items-center mb-4">
        <SidebarGroupLabel>Groups</SidebarGroupLabel>
        <Button
          size="icon-sm"
          onClick={() =>
            addWindow({
              id: "create-group",
              children: <CreateGroup />,
              initialHeight: 300,
              initialWidth: 400,
              title: "Create a Group",
              icon: <LucideUsers />,
              noResize: true,
              fitSize: true,
            })
          }
        >
          <LucidePlus />
        </Button>
      </div>
      <SidebarMenu className="flex gap-2 flex-col mb-2">
        {isLoading && (
          <LucideLoaderCircle className="animate-spin mx-auto text-muted-foreground" />
        )}
        {error && !isLoading && (
          <div className="rounded-lg bg-destructive border text-center p-2 text-sm">
            {error.message}
          </div>
        )}
        {data && data.length > 0 ? (
          data.map((group) => (
            <SidebarMenuItem key={group.id}>
              <SidebarMenuButton>
                <LucideUsers className="size-4" />
                <span>{group.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {group.users?.length || 0}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <p className="text-xs text-muted-foreground mx-auto">
            You don't have group ahahah
          </p>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
