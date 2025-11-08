import { List } from "@/components/list";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useChats } from "@/hooks/use-chats";
import { LucideSearch } from "lucide-react";
import ChatItemSkeleton from "./chat-item-skeleton";
import ChatItem from "./chat-item";
import AddFriendPopover from "./add-friend-popover";

export default function ChatSidebar() {
  const { data, error, isLoading, fetchNextPage } = useChats();
  return (
    <div className="bg-card p-2 rounded-xl border grid grid-rows-[auto_minmax(0,1fr)] w-sm gap-2">
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput />
          <InputGroupAddon align={"inline-end"}>
            <LucideSearch />
          </InputGroupAddon>
        </InputGroup>
        <AddFriendPopover />
      </div>
      <List
        className="flex flex-col gap-2"
        onMaxScroll={() => !error && !isLoading && fetchNextPage()}
      >
        {isLoading ? (
          Array.from({ length: 20 }).map((_, i) => <ChatItemSkeleton key={i} />)
        ) : error ? (
          <p className="text-destructive">{error.message}</p>
        ) : (
          data &&
          (data.pages.length == 0 ? (
            <p className="text-sm text-muted-foreground"></p>
          ) : (
            data.pages.map((c) => c.chats.map((c) => <ChatItem chat={c} />))
          ))
        )}
      </List>
    </div>
  );
}
