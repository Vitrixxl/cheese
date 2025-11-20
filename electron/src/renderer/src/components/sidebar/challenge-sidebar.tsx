import { LucideSearch, LucideSwords } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { SidebarMenuButton } from '../ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useAtomValue } from 'jotai'
import { challengesAtom } from '@/store/hub'
import ChallengeItem from '../challenge-item'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { useSearchFriend } from '@/hooks/use-friends'
import React from 'react'
import UserChallengeItem from '../user-challenge-item'
import { useHubWsAction } from '@/hooks/use-hub-ws-action'

export const ChallengeSidebar = () => {
  const challenges = useAtomValue(challengesAtom)
  const [query, setQuery] = React.useState('')
  const { data } = useSearchFriend(query)
  const { handleChallengeResponse } = useHubWsAction()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton className="flex gap-4">
          <LucideSwords className="text-red-500" />
          Challenge
          {challenges.length > 0 && (
            <div className="bg-primary text-primary-foreground ml-auto grid h-5 place-content-center rounded-full px-3 font-bold">
              {challenges.length >= 9 ? '9+' : challenges.length}
            </div>
          )}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8} align="start" className="w-auto">
        <Tabs>
          <TabsList className="w-full">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="new">New challenge</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            <div className="flex w-sm flex-col">
              {challenges.length == 0 ? (
                <p className="text-muted-foreground mx-auto text-sm">No challenge</p>
              ) : (
                challenges.map((c) => (
                  <ChallengeItem
                    challenge={c}
                    onResponse={(response) => handleChallengeResponse(c.id, response)}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="new">
            <div className="flex w-xs flex-col gap-2">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search a friend to challenge"
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
                <InputGroupAddon>
                  <LucideSearch />
                </InputGroupAddon>
              </InputGroup>
              {data && data.map((u) => <UserChallengeItem user={u} />)}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
