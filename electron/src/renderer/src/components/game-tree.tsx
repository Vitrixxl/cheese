// import type { GameTree, GameTreeMove } from '@shared'
// import { chessHistoryAtom, uiMovesPathKeyAtom } from '@/store'
// import { useAtomValue } from 'jotai'
// import { Button } from './ui/button'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
// import { ScrollArea } from './ui/scroll-area'
// import { useBoardController } from '@/hooks/use-board-controller'
// import { useAnalyseMoves } from '@/hooks/use-analyse-moves'
// import { cn } from '@/lib/utils'
// import React, { useState } from 'react'
// import type { Color } from 'chess.js'
//
// type GameTreeComponentProps = {
//   gameTreeMove: GameTree[number]
//   moveHistory: string[]
//   onSelect: (moves: string[], branchKey: string) => void
//   lastBlack: GameTreeMove | null
//   nextWhite: (GameTreeMove & { branchKey: string }) | null
//   currentMovesPath: string
//   branchKey: string
// }
//
// type GameTreeNextMovesSelectorProps = {
//   nextMoves: (GameTreeMove & { branchKey: string })[]
//   onNext: (move: string, branchKey: string) => void
// }
//
// export function GameTreeNextMovesSelector({ nextMoves, onNext }: GameTreeNextMovesSelectorProps) {
//   const [selectedIndex, setSelectedIndex] = React.useState(0)
//
//   const handleKeyDown = (e: KeyboardEvent) => {
//     e.stopPropagation()
//     if (e.key == 'ArrowUp') {
//       console.log('a')
//       setSelectedIndex((prev) => Math.max(0, prev - 1))
//       return
//     }
//     if (e.key == 'ArrowDown') {
//       setSelectedIndex((prev) => Math.min(nextMoves.length - 1, prev + 1))
//       return
//     }
//     if (e.key == 'ArrowRight' || e.key == 'Enter') {
//       onNext(nextMoves[selectedIndex].move, nextMoves[selectedIndex].branchKey)
//       return
//     }
//   }
//
//   React.useEffect(() => {
//     document.addEventListener('keydown', handleKeyDown, { capture: true })
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown, { capture: true })
//     }
//   }, [nextMoves])
//
//   return (
//     <div className="bg-card absolute top-full left-0 z-10 mt-0.5 flex flex-col gap-0 rounded-lg border px-1 py-1">
//       {nextMoves.map((m, i) => (
//         <div
//           className={cn(
//             'text-muted-foreground rounded-md px-2 py-1 transition-colors',
//             i == selectedIndex && 'bg-accent text-foreground',
//           )}
//         >
//           {m.move}
//         </div>
//       ))}
//     </div>
//   )
// }
//
// export function GameTreeMoveComponent({
//   gameTreeMove,
//   moveHistory,
//   onSelect,
//   lastBlack,
//   nextWhite,
//   currentMovesPath,
//   branchKey,
// }: GameTreeComponentProps) {
//   gameTreeMove.isMain && console.log({ moveHistory, index: gameTreeMove.index, branchKey })
//   const localWhiteMoveHistory: string[] = moveHistory.slice(0, moveHistory.length - 2)
//   const localBlackMoveHistory: string[] = moveHistory.slice(0, moveHistory.length - 2)
//   const [displayNextWhiteMoves, setDisplayNextWhiteMoves] = React.useState(false)
//   const nextWhiteMoves = [
//     nextWhite,
//     ...gameTreeMove.blackVariations
//       .map((v, i) => ({ ...v[0].whiteMove, branchKey: `${branchKey}${i}` }))
//       .flat(),
//   ].filter(Boolean) as (GameTreeMove & { branchKey: string })[]
//   let localKeyCount = 0
//   const [selected, setSelected] = useState<Color | null>(null)
//   React.useEffect(() => {
//     setSelected(
//       currentMovesPath ==
//         `${(gameTreeMove.blackMove
//           ? moveHistory.slice(0, moveHistory.length - 1)
//           : moveHistory
//         ).join()}${branchKey}`
//         ? 'w'
//         : currentMovesPath == `${moveHistory.join()}${branchKey}`
//           ? 'b'
//           : null,
//     )
//   }, [moveHistory, branchKey, currentMovesPath])
//
//   const handleKeyPress = (e: KeyboardEvent) => {
//     if (!selected) return
//     if (e.key == 'ArrowRight' && selected == 'w') {
//       onSelect(moveHistory, branchKey)
//       return
//     }
//     if (e.key == 'ArrowLeft' && selected == 'b') {
//       onSelect(moveHistory, branchKey)
//       onSelect(moveHistory.slice(0, moveHistory.length - 1), branchKey)
//       return
//     }
//     if (e.key == 'ArrowRight' && selected == 'b') {
//       if (nextWhiteMoves.length == 0) {
//         const current = nextWhiteMoves[0]
//         if (!current) return
//         onSelect([...moveHistory, current.move], `${branchKey}${current.branchKey}`)
//         return
//       }
//       setDisplayNextWhiteMoves(true)
//       return
//     }
//   }
//
//   React.useEffect(() => {
//     if (!selected) {
//       setDisplayNextWhiteMoves(false)
//       return
//     }
//
//     document.addEventListener('keydown', handleKeyPress)
//     return () => document.removeEventListener('keydown', handleKeyPress)
//   }, [selected])
//
//   return (
//     <div className="flex flex-col gap-2 text-xs select-none">
//       <div className="flex items-center gap-2">
//         <div className="w-4">{gameTreeMove.index}</div>
//         <div
//           className={cn(
//             'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-lg border px-2 py-1',
//             currentMovesPath ==
//               `${(gameTreeMove.blackMove
//                 ? moveHistory.slice(0, moveHistory.length - 1)
//                 : moveHistory
//               ).join()}${branchKey}` && 'text-foreground bg-accent',
//           )}
//           onClick={() =>
//             onSelect(
//               gameTreeMove.blackMove ? moveHistory.slice(0, moveHistory.length - 1) : moveHistory,
//               branchKey,
//             )
//           }
//         >
//           {gameTreeMove.whiteMove.move}
//         </div>
//         {gameTreeMove.blackMove && (
//           <div className="relative">
//             <div
//               className={cn(
//                 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-lg border px-2 py-1',
//                 currentMovesPath == `${moveHistory.join()}${branchKey}` &&
//                   'text-foreground bg-accent',
//               )}
//               onClick={() => onSelect(moveHistory, branchKey)}
//             >
//               {gameTreeMove?.blackMove?.move}
//             </div>
//             {displayNextWhiteMoves && (
//               <GameTreeNextMovesSelector
//                 nextMoves={nextWhiteMoves}
//                 onNext={({ move, branchKey }) => onSelect([...moveHistory, move], branchKey)}
//               />
//             )}
//           </div>
//         )}
//       </div>
//
//       <div className="flex flex-col gap-2">
//         {gameTreeMove.whiteVariations.length > 0 && (
//           <div className="flex flex-wrap gap-x-2 border-l-2 pl-4">
//             {gameTreeMove.whiteVariations.map((v) =>
//               v.map((p) => {
//                 localWhiteMoveHistory.push(p.whiteMove.move)
//                 if (p.blackMove) {
//                   localWhiteMoveHistory.push(p.blackMove.move)
//                 }
//                 localKeyCount++
//                 return (
//                   <GameTreeMoveComponent
//                     gameTreeMove={p}
//                     key={p.index}
//                     moveHistory={[...localWhiteMoveHistory]}
//                     onSelect={onSelect}
//                     currentMovesPath={currentMovesPath}
//                     branchKey={`${branchKey}${localKeyCount}`}
//                   />
//                 )
//               }),
//             )}
//           </div>
//         )}
//         {gameTreeMove.blackVariations.length > 0 && (
//           <div className="flex flex-wrap gap-x-2 border-l-2 pl-4">
//             {gameTreeMove.blackVariations.map((v) =>
//               v.map((p, i) => {
//                 localBlackMoveHistory.push(p.whiteMove.move)
//                 if (p.blackMove) {
//                   localBlackMoveHistory.push(p.blackMove.move)
//                 }
//                 localKeyCount++
//                 return (
//                   <GameTreeMoveComponent
//                     gameTreeMove={p}
//                     key={p.index}
//                     moveHistory={[...localBlackMoveHistory]}
//                     onSelect={onSelect}
//                     currentMovesPath={currentMovesPath}
//                     branchKey={`${branchKey}${localKeyCount}`}
//                   />
//                 )
//               }),
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
//
// export default function GameTreeMain() {
//   const { setMovesPath, setUiMovesPathKey, resyncUi } = useBoardController()
//   const uiMovesPathKey = useAtomValue(uiMovesPathKeyAtom)
//   const { analyse, gameTree, isAnalysing } = useAnalyseMoves()
//
//   const history = useAtomValue(chessHistoryAtom)
//
//   const handleSelect = (moves: string[], branchKey: string) => {
//     setMovesPath(moves)
//     setUiMovesPathKey(`${moves.join()}${branchKey}`)
//   }
//
//   const handleNext = () => {}
//
//   const localMoveHistory: string[] = []
//   return (
//     <Card className="grid max-h-full min-h-0 w-lg grid-rows-[auto_minmax(0,1fr)_auto]">
//       <CardHeader>
//         <CardTitle>Analysis</CardTitle>
//         <CardDescription>
//           Navigate through your game and explore the paths that you missed
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="h-full">
//         <ScrollArea className="h-full">
//           <div className="flex flex-col gap-3">
//             {gameTree &&
//               gameTree.length > 0 &&
//               gameTree[0].whiteMove &&
//               gameTree.map((p, i) => {
//                 localMoveHistory.push(p.whiteMove.move)
//
//                 if (p.blackMove) {
//                   localMoveHistory.push(p.blackMove.move)
//                 }
//                 return (
//                   <GameTreeMoveComponent
//                     gameTreeMove={p}
//                     key={p.index}
//                     moveHistory={[...localMoveHistory]}
//                     onSelect={handleSelect}
//                     currentMovesPath={uiMovesPathKey}
//                     branchKey={i.toString()}
//                     nextWhite={
//                       gameTree.length > i + 1
//                         ? { ...gameTree[i + 1].whiteMove, branchKey: (i + 1).toString() }
//                         : null
//                     }
//                   />
//                 )
//               })}
//           </div>
//         </ScrollArea>
//       </CardContent>
//       <CardFooter className="flex gap-4">
//         <Button
//           onClick={async () => await analyse(history)}
//           disabled={isAnalysing}
//           className="flex-1"
//         >
//           {isAnalysing ? 'Analysing...' : 'Analyse'}
//         </Button>
//         {uiMovesPathKey != '' && (
//           <Button onClick={resyncUi} className="flex-1">
//             Resync
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   )
// }
