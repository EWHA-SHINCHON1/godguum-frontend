import { Route, Routes } from "react-router-dom";

import SplashPage from "../pages/onboarding/SplashPage";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/onboarding/LoginPage";
import SearchPage from "../pages/search/SearchPage";
import PromotionListPage from "../pages/promotion/PromotionListPage";
import PromotionDetailPage from "../pages/promotion/PromotionDetailPage";
import OwnerEntryPage from "../pages/owner/OwnerEntryPage";
import OwnerPromotionPage from "../pages/owner/OwnerPromotionPage";
import OwnerPerformancePage from "../pages/owner/OwnerPerformancePage";
import SavedPromotionsPage from "../pages/bookmark/SavedPromotionsPage";
import StoreInfoPage from "../pages/stores/StoreInfoPage";
import MyPage from "../pages/my/MyPage";
import MyHistory from "../pages/my/MyHistory";
import MyCoupon from "../pages/my/MyCoupon";
import MyCouponUse from "../pages/my/MyCouponUse";
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

      <Route path="/owner" element={<OwnerEntryPage />} />
      <Route path="/owner/promotions" element={<OwnerPromotionPage />} />

      <Route
        path="/owner/promotions/:promotionId/performance"
        element={<OwnerPerformancePage />}
      />

      <Route path="/stores/:storeId" element={<StoreInfoPage />} />

      <Route path="/my" element={<MyPage />} />
      <Route path="/my/history" element={<MyHistory />} />
      <Route path="/my/coupons" element={<MyCoupon />} />
      <Route path="/my/coupons/:couponId/use" element={<MyCouponUse />} />

      <Route path="/saved" element={<SavedPromotionsPage />} />
    </Routes>
  );
}
