import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./app/layout";
import AppPage from "./app/page";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<AppPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
