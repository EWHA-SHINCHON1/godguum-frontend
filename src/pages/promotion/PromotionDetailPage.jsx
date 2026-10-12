import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import couponReceivedImage from "../../assets/icons/promotion/coupon-received.svg";
import { ConfirmModal, CouponIssueBar, Header } from "../../components/common";
import PromotionDetailTabs from "../../components/promotion/PromotionDetailTabs";
import PromotionInfoTab from "../../components/promotion/PromotionInfoTab";
import PromotionOverview from "../../components/promotion/PromotionOverview";
import StoreStoryTab from "../../components/promotion/StoreStoryTab";
import { getPromotionDetail } from "../../mocks/promotions";
import { useSavedPromotions } from "../../store/savedPromotions";

const DETAIL_TABS = [
  { value: "info", label: "프로모션 정보" },
  { value: "story", label: "가게 이야기" },
];

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const { isSaved, setSaved } = useSavedPromotions();
  const detail = getPromotionDetail(promotionId);
  const [activeTab, setActiveTab] = useState("info");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  if (!detail) {
    return (
      <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
        <Header
          title="프로모션"
          onBack={() => navigate(-1)}
          className="bg-transparent"
        />
        <p className="py-20 text-center text-body2 font-medium text-fg-muted">
          프로모션을 찾을 수 없어요
        </p>
      </main>
    );
  }

  const promotion = { ...detail, saved: isSaved(detail.id) };

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-[70px]">
      <Header
        title="프로모션"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      <PromotionOverview
        promotion={promotion}
        // TODO: 매장정보 화면 추가 후 연결
        onStoreClick={() => {}}
        onToggleSave={(saved) => setSaved(promotion.id, saved)}
      />

      <PromotionDetailTabs
        items={DETAIL_TABS}
        value={activeTab}
        onChange={setActiveTab}
        className="mt-2.5"
      />

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "info" ? (
          <PromotionInfoTab promotion={promotion} />
        ) : (
          <StoreStoryTab promotion={promotion} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[402px]">
        <CouponIssueBar
          hasCoupon={promotion.hasCoupon}
          onClick={() => setIsCouponModalOpen(true)}
        />
      </div>

      <ConfirmModal
        open={isCouponModalOpen}
        image={couponReceivedImage}
        title="쿠폰을 받았어요!"
        description="매장 방문 시 바로 사용할 수 있어요"
        cancelText="취소"
        confirmText="내 쿠폰 보기"
        onClose={() => setIsCouponModalOpen(false)}
        // TODO: 내 쿠폰 화면 추가 후 이동
        onConfirm={() => setIsCouponModalOpen(false)}
      />
    </main>
  );
}
