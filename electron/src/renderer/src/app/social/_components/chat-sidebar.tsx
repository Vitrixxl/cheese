import { List } from '@/components/list'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useChats } from '@/hooks/use-chats'
import { LucideSearch } from 'lucide-react'
import ChatItemSkeleton from './chat-item-skeleton'
import ChatItem from './chat-item'
import AddFriendPopover from './add-friend-popover'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MotionContainer from '@/components/motion-container'

export default function ChatSidebar() {
  const { data, error, isLoading, fetchNextPage } = useChats()
  return (
    <MotionContainer from="left" delay={0}>
      <Card className="bg-card grid h-fit w-sm grid-rows-[auto_minmax(0,1fr)] gap-2 rounded-xl border">
        <CardHeader>
          {' '}
          <CardTitle>Chats</CardTitle>
          <CardDescription>
            Chats with your friends, create groups and challenge them !
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2">
            <InputGroup>
              <InputGroupInput />
              <InputGroupAddon align={'inline-end'}>
                <LucideSearch />
              </InputGroupAddon>
            </InputGroup>
            <AddFriendPopover />
          </div>
          <List
            className={cn(
              'flex h-fit flex-col',
              data && data.pages.length > 0 && data.pages[0].chats.length > 0 && 'mt-2',
            )}
            onMaxScroll={() => !error && !isLoading && fetchNextPage()}
          >
            {isLoading ? (
              Array.from({ length: 20 }).map((_, i) => <ChatItemSkeleton key={i} />)
            ) : error ? (
              <p className="text-destructive">{error.message}</p>
            ) : (
              data &&
              (data.pages.length == 0 ? (
                <p className="text-muted-foreground text-sm"></p>
              ) : (
                data.pages.map((c) => c.chats.map((c) => <ChatItem chat={c} />))
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </MotionContainer>
  )
}
