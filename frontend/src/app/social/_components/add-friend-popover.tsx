import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchFriend } from "@/hooks/use-friends";
import { LucidePlus, LucideSearch } from "lucide-react";
import React from "react";
import UserItem from "./user-item";

export default function AddFriendPopover() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { data, isLoading, error } = useSearchFriend(query);
  React.useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
  }, [isOpen]);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon">
          <LucidePlus />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="bg-card grid grid-rows-[auto_minmax(300px)] gap-4 w-auto max-w-lg"
      >
        <InputGroup>
          <InputGroupInput
            placeholder="Search your friend name"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <InputGroupAddon align={"inline-end"}>
            <LucideSearch />
          </InputGroupAddon>
        </InputGroup>
        {data && data.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex flex-col gap-2 w-full">
              {data.map((user) => (
                <UserItem user={user} key={user.id} />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
