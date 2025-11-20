import TextareaAutosize from 'react-textarea-autosize'
import { InputGroup, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group'
import { useChat, useChatMessages, useLastSeen, useSendChatMessage } from '@/hooks/use-chats'
import { LucideSend, LucideSwords } from 'lucide-react'
import { useParams } from 'react-router'
import React from 'react'
import { ChatMessage } from '@/components/message'
import { useUser } from '@/hooks/use-user'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useAppNavigate } from '@/hooks/use-app-navigate'
import { GameSelector } from '@/components/game-selector'
import MotionContainer from '@/components/motion-container'

export default function ChatPage() {
  const { chatId } = useParams()
  const navigate = useAppNavigate()
  if (!chatId) {
    console.error('NO CHAT ID')
    navigate('/')
    return
  }

  const user = useUser()
  const { data } = useChatMessages(Number(chatId))
  const { mutate } = useSendChatMessage(Number(chatId))
  const [value, setValue] = React.useState('')
  const lastSeenMutation = useLastSeen(Number(chatId))

  const handleSubmit = () => {
    mutate({
      messageId: crypto.randomUUID(),
      content: value,
      gameId: null,
    })
  }

  React.useEffect(() => {
    lastSeenMutation.mutate()
  }, [])

  const { data: chatData } = useChat(Number(chatId))
  if (!data || !chatData) return null

  return (
    <MotionContainer from="top" delay={0.3} className="grid h-full max-h-full grid-rows-1">
      <div className="bg-card grid w-full max-w-lg grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] rounded-lg border">
        <div className="flex w-full items-center gap-2 border-b px-4 py-2">
          <div className="flex">
            {(chatData.users.length == 2
              ? [chatData.users.find((u) => u.id != user.id)!]
              : chatData.users.slice(1, 4)
            ).map((u, i) => (
              <UserAvatar url={u.image} name={u.name} className={cn(i % 2 != 0 && '-ml-4')} />
            ))}
          </div>
          <h3 className="font-semibold">
            {chatData.name ||
              chatData.users.find((u) => u.id != user.id)?.name ||
              'No name (never)'}
          </h3>
        </div>
        <ScrollArea className="">
          <div className="h-full w-full space-y-2 p-4 py-4">
            {data.pages.map((p) =>
              p.messages.map((m) => <ChatMessage message={m} isOwn={m.userId == user.id} />),
            )}
          </div>
        </ScrollArea>

        <div className="flex w-full px-4 py-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="ml-auto">
                <LucideSwords /> Challenge
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" sideOffset={8} className="grid gap-2">
              <GameSelector />
            </PopoverContent>
          </Popover>
        </div>
        <form
          className="px-4 pb-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <InputGroup>
            <TextareaAutosize
              data-slot="input-group-control"
              className="placeholder:text-muted-foreground flex field-sizing-content min-h-8 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
              placeholder="Write your message..."
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
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
    </MotionContainer>
  )
}
