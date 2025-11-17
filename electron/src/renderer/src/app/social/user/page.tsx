import GameItem from '@/app/games/_components/game-item'
import { gameIconMap } from '@/components/sidebar/game-sidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/user-avatar'
import { useSendFriendRequest } from '@/hooks/use-friends'
import { useProfile } from '@/hooks/use-profile'
import { LucideChevronDown, LucideLoaderCircle, LucidePuzzle } from 'lucide-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router'

export default function SocialUserPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading } = useProfile(userId!)
  const [hasSendRequest, setHasSendRequest] = React.useState(false)
  const { isSending, sendFriendRequest } = useSendFriendRequest()
  if (!userId) {
    navigate('/social')
    return null
  }

  if (isLoading || error || !data) return null

  const handleSending = async () => {
    const { error } = await sendFriendRequest(userId)
    if (error) {
      console.error(error)
      return
    }
    setHasSendRequest(true)
  }
  console.log({ games: data.games })

  return (
    <div className="flex h-full grid-rows-1 gap-2">
      <div className="grid h-fit max-h-full w-full max-w-md grid-rows-[auto_auto_auto] gap-2">
        <div className="col-span-1 flex items-center gap-2">
          <div className="bg-card flex w-full flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserAvatar className="" url={data.image} name={data.name} />

              <p className="font-semibold">{data.name}</p>
            </div>
            {data.bio && <p className="text-muted-foreground text-sm">{data.bio}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {data.elos.map((elo) => {
            const Icon = gameIconMap[elo.category]
            return (
              <div
                className="bg-card flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm"
                key={elo.category}
              >
                <Icon
                  className="size-5"
                  style={{
                    color: `var(--${elo.category}-color)`,
                  }}
                />
                <p className="font-semibold">{elo.elo}</p>
              </div>
            )
          })}
        </div>
        <div className="bg-card flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
          <LucidePuzzle className="size-5 text-green-500" />
          <span className="">Level</span>{' '}
          <span className="">
            <span className="text-green-500">{data.puzzleLevel}</span> /{' '}
            <span className="text-red-500">5423662</span>
          </span>{' '}
        </div>

        {!hasSendRequest && (
          <Button className="" disabled={isSending} onClick={handleSending}>
            {isSending ? <LucideLoaderCircle className="animate-spin" /> : 'Send a friend request'}
          </Button>
        )}
      </div>
      <Card className="grid h-fit grid-rows-[auto_minmax(0,1fr)_auto]">
        <CardHeader className="">
          <CardTitle>Game history</CardTitle>
          <CardDescription>Here's the last games of {data.name}</CardDescription>
        </CardHeader>
        <CardContent className="h-full px-0">
          <ScrollArea className="h-full px-4">
            <div className="flex flex-col gap-2">
              {data.games.slice(0, 5).map((g) => {
                return <GameItem game={g} />
              })}
            </div>
          </ScrollArea>
        </CardContent>
        {data.games.length > 5 && (
          <CardFooter>
            <Button variant={'ghost'} className="w-full">
              <LucideChevronDown />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
