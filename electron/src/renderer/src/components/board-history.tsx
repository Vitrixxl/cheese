import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { LucideRewind } from 'lucide-react'
import { Button } from './ui/button'
import { useAtomValue } from 'jotai'
import { chessHistoryAtom, historyIndexAtom } from '@/store'
import { useBoardController } from '@/hooks/use-board-controller'
import { ScrollArea } from './ui/scroll-area'
import { capitalize, cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ButtonGroup } from './ui/button-group'
import { auth } from '@/lib/auth'
import SideboardChat from './side-board/sideboard-chat'

const parseHistory = (history: string[]) => {
  const result: string[][] = []
  for (let i = 0; i < history.length; i += 2) {
    result.push(history.slice(i, i + 2))
  }
  return result
}

const triggers = ['history', 'chat', 'details'] as const
export const BoardHistory = () => {
  const history = useAtomValue(chessHistoryAtom)
  const parsedHistory = parseHistory(history)
  const index = useAtomValue(historyIndexAtom)
  const { undo, redo } = useBoardController()
  const { data: authData } = auth.useSession()
  let renderIndex = 0
  if (!authData) return

  return (
    <div className="w-lg shrink-0">
      <Tabs defaultValue={'history'} className="grid grid-rows-[auto_minmax(0,1fr)] h-full">
        <TabsList className="xl:w-full">
          {triggers.map((k) => (
            <TabsTrigger key={k} value={k}>
              {capitalize(k)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={'history'} className="gap-2 grid grid-rows-[minmax(0,1fr)_auto]">
          <Card className="grid grid-rows-[auto_minmax(0,1fr)]">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>List of the moves played during this game</CardDescription>
            </CardHeader>
            <ScrollArea className="h-full overflow-auto mr-2">
              <CardContent className="flex flex-col gap-2 ">
                {parsedHistory.length > 0 ? (
                  parsedHistory.map((t, i) => (
                    <div className="flex gap-2 items-end w-full" key={i}>
                      <span className="text-lg font-bold min-w-10">{i}.</span>
                      {t.map((m, i) => {
                        renderIndex++
                        return (
                          <div
                            key={i}
                            className={cn(
                              'border rounded-lg px-3 py-1 text-lg bg-accent text-muted-foreground',
                              index == renderIndex && 'text-foreground !bg-input/50'
                            )}
                          >
                            {m}
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <p className="mx-auto text-muted-foreground text-sm">No move yet</p>
                )}
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex gap-2 flex-col">
              <ButtonGroup className="w-full">
                <Button onClick={undo} variant="outline" className="flex-1">
                  <LucideRewind fill={'var(--primary-foreground)'} />
                </Button>
                <Button onClick={redo} variant={'outline'} className="flex-1">
                  <LucideRewind className="rotate-180" fill={'var(--primary-foreground)'} />
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>
          <ButtonGroup className="w-full">
            <Button onClick={undo} className="flex-1" variant={'outline'}>
              Ask for a draw
            </Button>
            <Button onClick={redo} className="flex-1" variant={'outline'}>
              Resign (you lil bitch)
            </Button>
          </ButtonGroup>
        </TabsContent>
        <TabsContent value="chat" className="gap-2 grid grid-rows-1">
          <SideboardChat />
        </TabsContent>
      </Tabs>
    </div>
  )
}
