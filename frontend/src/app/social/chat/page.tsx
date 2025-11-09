import TextareaAutosize from "react-textarea-autosize";
import { List } from "@/components/list";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  useChatData,
  useChatMessages,
  useSendChatMessage,
} from "@/hooks/use-chats";
import { LucideSend } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import React from "react";
import { ChatMessage } from "@/components/message";
import { useUser } from "@/hooks/use-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chat } from "@backend/lib/db/schema";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useChatMessages(Number(chatId));
  const { mutate } = useSendChatMessage(Number(chatId));
  const [value, setValue] = React.useState("");
  if (!chatId) {
    console.error("NO CHAT ID");
    navigate("/");
    return;
  }

  const handleSubmit = () => {
    mutate({ content: value });
  };

  const { data: chatData } = useChatData(Number(chatId));
  if (!data || !chatData) return null;
  const user = useUser();

  return (
    <div className="border rounded-lg grid grid-rows-[auto_minmax(0,1fr)_auto] max-w-lg w-full bg-card grid-cols-1">
      <div className="px-4 py-2 w-full border-b flex gap-2 items-center">
        <div className="flex">
          {chatData.users.slice(1, 4).map((u, i) => (
            <UserAvatar
              url={u.image}
              name={u.name}
              className={cn(i % 2 != 0 && "-ml-4")}
            />
          ))}
        </div>
        <h3 className="font-semibold">
          {chatData.name ||
            chatData.users.find((u) => u.id != user.id)?.name ||
            "No name (never)"}
        </h3>
      </div>
      <ScrollArea className="">
        <div className="p-4 h-full w-full space-y-2 py-4">
          {data.pages.map((p) =>
            p.messages.map((m) => (
              <ChatMessage
                user={user}
                message={m}
                isOwn={m.userId == user.id}
              />
            )),
          )}
        </div>
      </ScrollArea>
      <form
        className="px-4 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <InputGroup>
          <TextareaAutosize
            data-slot="input-group-control"
            className="flex field-sizing-content min-h-8 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm placeholder:text-muted-foreground"
            placeholder="Write your message..."
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
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
      </form>
    </div>
  );
}
