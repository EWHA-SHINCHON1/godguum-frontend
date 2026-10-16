import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import couponReceivedImage from "../../assets/icons/promotion/coupon-received.svg";
import { ConfirmModal, CouponIssueBar, Header } from "../../components/common";
import PromotionDetailTabs from "../../components/promotion/PromotionDetailTabs";
import PromotionInfoTab from "../../components/promotion/PromotionInfoTab";
import PromotionOverview from "../../components/promotion/PromotionOverview";
import StoreStoryTab from "../../components/promotion/StoreStoryTab";
import { getPromotionDetail } from "../../api/promotions";
import { useSavedPromotions } from "../../store/savedPromotions";
import { formatSeoulDate, getDday } from "../../utils/date";

const DETAIL_TABS = [
  { value: "info", label: "프로모션 정보" },
  { value: "story", label: "가게 이야기" },
];

// status 응답에 따른 label 지정
const STATUS_LABEL = {
  upcoming: "진행 예정",
  active: "진행중",
  sold_out: "쿠폰 소진",
  ended: "기간 종료",
};

//api 응답 전달 (format 맞춰서)
function toDetail(promotion) {
  return {
    ...promotion,
    id: promotion.id,
    storeId: promotion.store.id,
    storeName: promotion.store.name,
    title: promotion.title,
    period: `${formatSeoulDate(promotion.starts_at)} ~ ${formatSeoulDate(promotion.ends_at)}`,
    dDay: getDday(promotion.ends_at),
    status: STATUS_LABEL[promotion.status],
    hasCoupon: promotion.requires_coupon,
  };
}

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const { isSaved, setSaved } = useSavedPromotions();
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCurrent = true;
    setState({ data: null, loading: true, error: null });

    getPromotionDetail(promotionId)
      .then((data) => {
        if (isCurrent) setState({ data: data, loading: false, error: null });
      })
      .catch((error) => {
        if (isCurrent) setState({ data: null, loading: false, error: error });
      });

    return () => {
      isCurrent = false;
    };
  }, [promotionId]);

  const detail = state.data ? toDetail(state.data) : null;

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
        onStoreClick={() => navigate(`/stores/${promotion.storeId}`)}
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
