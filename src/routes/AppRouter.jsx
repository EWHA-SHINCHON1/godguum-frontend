import { Route, Routes } from "react-router-dom";

import SplashPage from "../pages/onboarding/SplashPage";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/onboarding/LoginPage";
import SearchPage from "../pages/search/SearchPage";
import PromotionListPage from "../pages/promotion/PromotionListPage";
import PromotionDetailPage from "../pages/promotion/PromotionDetailPage";
import OwnerPromotionPage from "../pages/owner/OwnerPromotionPage";
import OwnerPerformancePage from "../pages/owner/OwnerPerformancePage";
import SavedPromotionsPage from "../pages/bookmark/SavedPromotionsPage";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/promotions" element={<PromotionListPage />} />
      <Route
        path="/promotions/:promotionId"
        element={<PromotionDetailPage />}
      />

      <Route path="/owner/promotions" element={<OwnerPromotionPage />} />

      <Route
        path="/owner/promotions/:promotionId/performance"
        element={<OwnerPerformancePage />}
      />
      <Route path="/saved" element={<SavedPromotionsPage />} />
    </Routes>
  );
}
