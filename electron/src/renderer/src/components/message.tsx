import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@shared'

type MessageProps = {
  message: MessageType
  isOwn: boolean
}

export const ChatMessage = ({ message, isOwn }: MessageProps) => {
  return (
    <div
      className={cn(
        'flex w-fit max-w-4/5 flex-col gap-1',
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start',
      )}
    >
      {/* <div className={cn('flex items-center gap-2', !isOwn && 'flex-row-reverse')}> */}
      {/*   <p className="text-muted-foreground text-sm">{isOwn ? 'You' : user.name}</p> */}
      {/* </div> */}
      <div
        className={cn(
          'w-fit max-w-full rounded-lg px-2 py-1 break-all',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary',
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
