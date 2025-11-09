import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./app/layout";
import AppPage from "./app/page";
import SocialLayout from "./app/social/layout";
import SocialUserPage from "./app/social/user/page";
import ChatPage from "./app/social/chat/page";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<AppPage />} />
          <Route path="/social" element={<SocialLayout />}>
            <Route path="user/:userId" element={<SocialUserPage />}></Route>
            <Route path="chat/:chatId" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
