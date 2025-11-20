import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { LucideRewind } from 'lucide-react'
import { Button } from './ui/button'
import { useAtomValue } from 'jotai'
import { chessHistoryAtom } from '@/store'
import { useBoardController } from '@/hooks/use-board-controller'
import { ScrollArea } from './ui/scroll-area'
import { capitalize, cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ButtonGroup } from './ui/button-group'
import { auth } from '@/lib/auth'
import SideboardChat from './side-board/sideboard-chat'
import { useGameWsAction } from '@/hooks/use-game-ws-action'
import React from 'react'
import { useGameWsData } from '@/hooks/use-game-ws-data'

const parseHistory = (history: string[]) => {
  const result: string[][] = []
  for (let i = 0; i < history.length; i += 2) {
    result.push(history.slice(i, i + 2))
  }
  return result
}

const triggers = ['history', 'chat', 'details'] as const
export const BoardHistory = () => {
  const [drawClicked, setDrawClicked] = React.useState(false)
  const [resignClicked, setResignClicked] = React.useState(false)
  const history = useAtomValue(chessHistoryAtom)
  const parsedHistory = parseHistory(history)
  const { resign, offerDraw, handleDrawResponse } = useGameWsAction()
  const { drawOffer } = useGameWsData()

  const { undo, redo } = useBoardController()
  const { data: authData } = auth.useSession()
  let renderIndex = 0
  if (!authData) return

  return (
    <div className="w-md shrink-0">
      <Tabs defaultValue={'history'} className="grid h-full grid-rows-[auto_minmax(0,1fr)]">
        <TabsList className="xl:w-full">
          {triggers.map((k) => (
            <TabsTrigger key={k} value={k}>
              {capitalize(k)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={'history'} className="grid grid-rows-[minmax(0,1fr)_auto] gap-2">
          <Card className="grid grid-rows-[auto_minmax(0,1fr)]">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>List of the moves played during this game</CardDescription>
            </CardHeader>
            <ScrollArea className="mr-2 h-full overflow-auto">
              <CardContent className="flex flex-col gap-2">
                {parsedHistory.length > 0 ? (
                  parsedHistory.map((t, i) => (
                    <div className="flex w-full items-end gap-2" key={i}>
                      <span className="min-w-10 text-lg font-bold">{i}.</span>
                      {t.map((m, i) => {
                        renderIndex++
                        return (
                          <div
                            key={i}
                            className={cn(
                              'bg-accent text-muted-foreground rounded-lg border px-3 py-1 text-lg',
                              0 == renderIndex && 'text-foreground !bg-input/50',
                            )}
                          >
                            {m}
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground mx-auto text-sm">No move yet</p>
                )}
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex flex-col gap-2">
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
            <Button className="flex-1" variant={'outline'} onClick={() => setDrawClicked(true)}>
              Ask for a draw
            </Button>
            <Button className="flex-1" variant={'outline'} onClick={() => setResignClicked(true)}>
              Resign (you lil bitch)
            </Button>
          </ButtonGroup>
          {drawClicked && (
            <Card>
              <CardHeader>
                <CardTitle>Ask for a draw</CardTitle>
                <CardDescription>Are you sure to ask a draw ?</CardDescription>
              </CardHeader>
              <CardContent className="flex w-full gap-2">
                <Button className="flex-1" onClick={offerDraw}>
                  Ask for draw
                </Button>
                <Button
                  variant={'destructive'}
                  className="flex-1"
                  onClick={() => setDrawClicked(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
          {resignClicked && (
            <Card>
              <CardHeader>
                <CardTitle>Resign</CardTitle>
                <CardDescription>Are you sure to resign, the game will be lose</CardDescription>
              </CardHeader>
              <CardContent className="flex w-full gap-2">
                <Button className="flex-1" onClick={resign} variant={'destructive'}>
                  Resign
                </Button>
                <Button
                  variant={'outline'}
                  className="flex-1"
                  onClick={() => setResignClicked(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
          {drawOffer && (
            <Card>
              <CardHeader>
                <CardTitle>Your opponent offered a draw</CardTitle>
                <CardDescription>Are you gonna take it ?</CardDescription>
              </CardHeader>
              <CardContent className="flex w-full gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleDrawResponse(true)}
                  variant={'destructive'}
                >
                  Accept
                </Button>
                <Button
                  variant={'outline'}
                  className="flex-1"
                  onClick={() => handleDrawResponse(false)}
                >
                  Decline
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="chat" className="grid grid-rows-1 gap-2">
          <SideboardChat />
        </TabsContent>
      </Tabs>
    </div>
  )
}
