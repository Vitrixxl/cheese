import { UserAvatar } from '@/components/user-avatar'
import type { GameWithUsers, Outcome } from '@shared'
import { gameIconMap } from '@/components/sidebar/game-sidebar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Crown, LucideCog, LucideCrown, Swords, Target } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { capitalize, cn } from '@/lib/utils'

type GameItemProps = {
  game: GameWithUsers
  currentUserId?: string // Pour déterminer si c'est une victoire/défaite
}

const formatTimer = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function GameItem({ game, currentUserId }: GameItemProps) {
  const navigate = useNavigate()

  const isWhite = currentUserId === game.whiteId
  const isBlack = currentUserId === game.blackId
  const playerColor = isWhite ? 'w' : isBlack ? 'b' : null

  const isWin = playerColor && game.winner === playerColor
  const isLoss = playerColor && game.winner && game.winner !== playerColor
  const isDraw = !game.winner

  const CategoryIcon = gameIconMap[game.category]

  const whiteElo = game.white.elos.find((e) => e.category === game.category)?.elo
  const blackElo = game.black.elos.find((e) => e.category === game.category)?.elo

  return (
    <Link to={`/game/${game.id}`}>
      <Card
        className={cn(
          'group relative overflow-hidden !py-4 transition-all hover:shadow-lg',
          isWin && 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10',
          isLoss && 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10',
          isDraw && 'border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10',
          !playerColor && 'hover:bg-accent'
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <div
            className={cn(
              'flex flex-1 flex-col items-start gap-1',
              game.winner === 'w' && 'scale-105'
            )}
          >
            <div className="relative">
              <UserAvatar
                url={game.white.image ?? null}
                name={game.white.name}
                className="size-12"
              />
            </div>
            <Badge variant={'outline'} className="bg-white-square text-background">
              {game.white.name}
            </Badge>
            <div className="flex gap-2">
              {whiteElo && (
                <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                  <Target className="size-3" />
                  {whiteElo}
                </p>
              )}
              {game.winner == 'w' && (
                <Badge variant="outline" className="bg-white-square text-background">
                  <LucideCrown className="size-4" />
                </Badge>
              )}
            </div>
          </div>

          {/* VS + Info centrale */}
          <div className="flex flex-col items-center gap-2">
            <CategoryIcon className="size-8" style={{ color: `var(--${game.category}-color)` }} />

            {/* Timers restants */}
            <div className="text-muted-foreground flex items-center gap-4 text-xs">
              <span>{formatTimer(game.whiteTimer)}</span>
              <Clock className="size-3" />
              <span>{formatTimer(game.blackTimer)}</span>
            </div>
            <Badge
              variant={'outline'}
              className={cn(
                game.winner == 'w'
                  ? 'bg-white-square text-background'
                  : game.winner == 'b'
                    ? 'bg-black-square'
                    : null
              )}
            >
              {capitalize(game.outcome)}
            </Badge>
          </div>

          <div
            className={cn(
              'flex flex-1 flex-col items-end gap-1',
              game.winner === 'b' && 'scale-105'
            )}
          >
            <div className="relative">
              <UserAvatar
                url={game.black.image ?? null}
                name={game.black.name}
                className="size-12 rounded-md"
              />
            </div>
            <Badge variant={'outline'} className="bg-black-square">
              {game.black.name}
            </Badge>
            <div className="flex gap-2">
              {game.winner == 'b' && (
                <Badge variant="outline" className="bg-black-square">
                  <LucideCrown className="size-4" />
                </Badge>
              )}
              {blackElo && (
                <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                  {blackElo}
                  <Target className="size-3" />
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
