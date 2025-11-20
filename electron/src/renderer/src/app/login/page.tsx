import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { Crown } from 'lucide-react'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    auth.signIn.social({ provider: 'google', callbackURL: 'http://localhost:5173' })
  }

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Chess pattern background */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="chess-pattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill="currentColor" />
              <rect x="40" y="40" width="40" height="40" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chess-pattern)" />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="from-primary/5 to-primary/10 absolute inset-0 bg-gradient-to-br via-transparent" />

      {/* Login card */}
      <Card className="border-border/50 animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md shadow-2xl backdrop-blur-sm duration-500">
        <CardHeader className="space-y-4 text-center">
          <div className="bg-primary/10 ring-primary/5 mx-auto flex size-16 items-center justify-center rounded-2xl ring-8">
            <Crown className="text-primary size-8" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome to Chessinator
            </CardTitle>
            <CardDescription className="text-base">
              Master the game, challenge friends, and rise through the ranks
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="group relative w-full overflow-hidden text-base font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="from-primary/0 via-primary-foreground/10 to-primary/0 absolute inset-0 translate-x-[-100%] bg-gradient-to-r transition-transform duration-1000 group-hover:translate-x-[100%]" />
            <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-muted-foreground space-y-4 pt-2 text-center text-xs">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary size-2 animate-pulse rounded-full" />
                <span>Play Chess</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary size-2 animate-pulse rounded-full [animation-delay:200ms]" />
                <span>Solve Puzzles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary size-2 animate-pulse rounded-full [animation-delay:400ms]" />
                <span>Track Stats</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-32 -left-32 size-64 rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute -right-32 -bottom-32 size-64 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
