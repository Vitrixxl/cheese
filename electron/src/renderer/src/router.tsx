import { HashRouter, Route, Routes } from 'react-router'
import AppLayout from './app/layout'
import AppPage from './app/page'
import SocialLayout from './app/social/layout'
import SocialUserPage from './app/social/user/page'
import ChatPage from './app/social/chat/page'
import PuzzleDrivenBoard from './components/drived-board/puzzle/puzzle-driven-board'
import GamesPage from './app/games/page'
import GamePage from './app/game/page'
import Protected from './components/protected'
import LoginPage from './app/login/page'
import { api } from './lib/api'
export default function Router() {
  api.test.get()
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<AppPage />} />
          <Route path="/social" element={<SocialLayout />}>
            <Route path="user/:userId" element={<SocialUserPage />}></Route>
            <Route path="chat/:chatId" element={<ChatPage />} />
          </Route>
          <Route path="/puzzles" element={<PuzzleDrivenBoard />}></Route>
          <Route path="/games" element={<GamesPage />}></Route>
          <Route path="/game/:gameId" element={<GamePage />}></Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  )
}
