import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUsersGames } from '@/hooks/use-games'
import { LucideLoaderCircle } from 'lucide-react'
import GameItem from './_components/game-item'

export default function GamesPage() {
  const { data, error, isLoading } = useUsersGames()
  return (
    <div className="flex size-full gap-4">
      <Card className="grid w-lg grid-rows-[auto_minmax(0,1fr)]">
        <CardHeader>
          <CardTitle>Your games</CardTitle>
          <CardDescription>
            Here's a list of your game, you can analyse them to improve and gain elo
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {isLoading ? (
            <div className="grid size-full place-content-center">
              <LucideLoaderCircle className="size-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="grid size-full place-content-center rounded-lg p-2">
              <div className="bg-destructive/30 border text-sm">{error.message}</div>
            </div>
          ) : !data ? null : data.pages.length == 0 || data.pages[0].games.length == 0 ? (
            <div className="bg-destructive/30 border">No game</div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex h-full flex-col gap-2">
                {data.pages.map((p) => p.games.map((g) => <GameItem game={g} />))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
