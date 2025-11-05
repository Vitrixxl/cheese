import TextareaAutosize from "react-textarea-autosize";

import {
  LucideLoaderCircle,
  LucidePlus,
  LucideSend,
  LucideUsers,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useWindows } from "../window";
import React, { useState } from "react";
import { useGroups, useCreateGroup } from "@/hooks/use-groups";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { GroupWithUsers } from "@shared";
import { useChatMessages, useSendMessage } from "@/hooks/use-chats";
import { UserAvatar } from "../user-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { List } from "../list";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import { ChatMessage } from "../message";
import { auth } from "@/lib/auth";

export function GroupWindowContent({ group }: { group: GroupWithUsers }) {
  const [value, setValue] = useState<string>("");
  const { data, error, isLoading } = useChatMessages(group.chatId);
  const { mutate } = useSendMessage();
  const { data: sessionData } = auth.useSession();
  const handleSubmit = () => {
    mutate({ chatId: group.chatId, content: value });
  };
  if (!sessionData) return;

  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)_auto] h-full">
      <div className="border-b flex gap-2 justify-between p-2">
        <div className="flex flex-row-reverse [&>*]:not-last:-ml-2 items-center">
          {group.users.map((u) => (
            <Tooltip key={u.id}>
              <TooltipTrigger>
                <UserAvatar url={u.image} name={u.name} />
              </TooltipTrigger>
              <TooltipContent>{u.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Button>
          Add a friend <LucidePlus />
        </Button>
      </div>
      <List scrollDirection="bottom-to-top" className="h-full p-2">
        {isLoading && (
          <LucideLoaderCircle className="animate-spin mx-auto my-auto" />
        )}
        {error && !isLoading && <p>{error.message}</p>}
        {!isLoading &&
          data &&
          data.pages.length > 0 &&
          data.pages.map(({ messages }) =>
            messages.length > 0 ? (
              messages.map((m) => (
                <ChatMessage
                  message={m}
                  user={
                    group.users.find((u) => u.id == m.userId) ??
                    sessionData.user
                  }
                  isOwn={sessionData.user.id == m.userId}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground m-auto">
                No message here
              </p>
            ),
          )}
      </List>
      <div className="p-2">
        <InputGroup>
          <TextareaAutosize
            data-slot="input-group-control"
            className="flex field-sizing-content min-h-8 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm placeholder:text-muted-foreground"
            placeholder="Write your message..."
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              className="ml-auto"
              size="sm"
              variant="default"
              disabled={value.trim().length == 0}
              onClick={handleSubmit}
            >
              Send <LucideSend />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col gap-4 p-4">
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
            <SidebarMenuItem
              key={group.id}
              onClick={() =>
                addWindow({
                  id: group.id.toString(),
                  children: <GroupWindowContent group={group} />,
                  initialHeight: 500,
                  initialWidth: 500,
                  title: group.name,
                  icon: <LucideUsers />,
                })
              }
            >
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
