import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import couponReceivedImage from "../../assets/icons/promotion/coupon-received.svg";
import {
  Button,
  ConfirmModal,
  CouponIssueBar,
  Header,
} from "../../components/common";
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
  // "다시 시도" 버튼을 누르면 값이 바뀌면서 상세를 다시 조회
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [promotionId, reloadKey]);

  const detail = state.data ? toDetail(state.data) : null;

  const [activeTab, setActiveTab] = useState("info");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // 로딩 → 404 → 기타 오류 순서로 검사 (명세서 8. 오류 처리)
  // 종료·소진 프로모션은 정상 응답(200)이라 여기 걸리지 않고 상세가 그대로 표시됨
  if (state.loading || state.error || !detail) {
    const isNotFound = state.error?.status === 404;

    let message = "불러오는 중이에요";
    let action = null;

    if (isNotFound) {
      // 없음·비공개·비활성 매장 프로모션
      message = "프로모션을 찾을 수 없어요";
      action = (
        <Button variant="secondary" onClick={() => navigate("/promotions")}>
          프로모션 둘러보기
        </Button>
      );
    } else if (state.error) {
      // 서버·네트워크 오류
      message = "프로모션을 불러오지 못했어요";
      action = (
        <Button
          variant="secondary"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          다시 시도
        </Button>
      );
    }

    return (
      <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
        <Header
          title="프로모션"
          onBack={() => navigate(-1)}
          className="bg-transparent"
        />
        <div className="flex flex-col items-center gap-4 py-20">
          <p
            className="text-center text-body2 font-medium text-fg-muted"
            role={state.error ? "alert" : "status"}
          >
            {message}
          </p>
          {action}
        </div>
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
