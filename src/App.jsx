import { Routes, Route, Outlet } from "react-router-dom";
import GNB from "./components/common/GNB";
import LoginPage from "./pages/onboarding/LoginPage";
import SplashPage from "./pages/onboarding/SplashPage";

// 모든 페이지에 공통으로 들어갈 틀
function Layout() {
  return (
    <>
      <GNB />
      <Outlet /> {/* 여기에 각 페이지가 바뀌어 들어옴 */}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/splash" element={<SplashPage />} />
      </Route>
    </Routes>
  );
}
