import TextareaAutosize from "react-textarea-autosize";
import { useAtom, useAtomValue } from "jotai";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { gameMessagesAtom } from "@/store";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import { LucideSend } from "lucide-react";
import React from "react";
import { gameWsAtom } from "@/store/ws";
import type { ChessClientMessage } from "@game-server/types";
export default function SideboardChat() {
  const user = useUser();

  const [messages, setMessage] = useAtom(gameMessagesAtom);
  const [value, setValue] = React.useState<string>("");
  const ws = useAtomValue(gameWsAtom);
  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || !ws) {
      return;
    }

    ws.send({
      key: "message",
      payload: {
        content: value,
      },
    } satisfies ChessClientMessage);
    setMessage((prev) => [...prev, { userId: user.id, content: trimmed }]);
    setValue("");
  };
  return (
    <Card className="max-h-full h-fit grid grid-rows-[auto_minmax(0,1fr)]">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
        <CardDescription>
          Chat with you opponent in a respectful way (even if he's beating your
          ass)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-rows-[minmax(0,1fr)_auto] gap-2">
        <ScrollArea className="overflow-y-auto ">
          <div className="flex flex-col gap-2">
            {messages.length > 0
              ? messages.map((m) => {
                  const own = user.id == m.userId;
                  return (
                    <div
                      className={cn(
                        "flex flex-col gap-2 max-w-4/5 rounded-lg px-2 py-1 w-fit",
                        own ? "ml-auto bg-primary" : "bg-secondary border",
                      )}
                    >
                      {m.content}
                    </div>
                  );
                })
              : ""}
          </div>
        </ScrollArea>

        <form
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
      </CardContent>
    </Card>
  );
}
