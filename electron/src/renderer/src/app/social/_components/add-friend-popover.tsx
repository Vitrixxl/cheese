import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LucideSearch, LucideUserPlus } from 'lucide-react'
import React from 'react'
import UserItem from './user-item'
import { useSearchUsers } from '@/hooks/use-users'

export default function AddFriendPopover() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const { data } = useSearchUsers(query)
  React.useEffect(() => {
    if (!isOpen) {
      setQuery('')
      return
    }
  }, [isOpen])
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon">
          <LucideUserPlus />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="bg-card grid w-auto max-w-lg grid-rows-[auto_minmax(300px)] gap-4"
      >
        <InputGroup>
          <InputGroupInput
            placeholder="Search your friend name"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <InputGroupAddon align={'inline-end'}>
            <LucideSearch />
          </InputGroupAddon>
        </InputGroup>
        {data && data.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex w-full flex-col gap-2">
              {data.map((user) => (
                <UserItem user={user} key={user.id} />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
