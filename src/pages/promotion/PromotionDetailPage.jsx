import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import {
  createPromotionEvent,
  getPromotionDetail,
  sendPromotionEvent,
} from "../../api/promotions";
import { ensureLoggedIn } from "../../api/auth";
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
    dDay: getDday(promotion.starts_at, promotion.ends_at),
    status: STATUS_LABEL[promotion.status],
    hasCoupon: promotion.requires_coupon,
  };
}

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  // location.pathname = 지금 주소창 경로 (예: "/promotions/12")
  // 로그인 후 이 페이지로 돌아오기 위해 사용
  const location = useLocation();
  const { promotionId } = useParams();
  // 북마크는 모든 화면이 같은 로직을 쓰도록 store/SavedPromotionsProvider.jsx 로 옮김
  // isSaved: 아이콘 상태 / toggleSave: 북마크 버튼 동작
  const { isSaved, toggleSave } = useSavedPromotions();
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

  // 조회 이벤트: 상세 데이터를 받아 화면에 실제로 그린 뒤 프로모션당 1번만 전송
  // - 로딩 중·조회 실패 상태에서는 보내지 않음 (state.data 가 있을 때만)
  // - ref 에 이미 보낸 프로모션 ID 를 기록해서, 개발 모드 effect 2번 실행·리렌더링·
  //   북마크/쿠폰 후 상세 재조회로는 다시 보내지 않음
  // - 다른 프로모션으로 이동하면 ID 가 달라지므로 새 조회로 기록
  const viewSentForRef = useRef(null);

  useEffect(() => {
    if (!state.data) return;

    const id = String(state.data.id);
    if (viewSentForRef.current === id) return;

    viewSentForRef.current = id;
    sendPromotionEvent(id, createPromotionEvent("view"));
  }, [state.data]);

  const detail = state.data ? toDetail(state.data) : null;

  const [activeTab, setActiveTab] = useState("info");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // 쿠폰 버튼 클릭
  // 1) 로그인 확인 → 안 돼 있으면 카카오 로그인으로 이동 (끝나면 이 상세로 복귀)
  // 2) 로그인 돼 있으면 다음 동작 진행
  // TODO(8단계): 지금은 모달만 띄움. 쿠폰 발급 API 연결 시 이 자리에서 발급 요청
  const handleCouponClick = async () => {
    try {
      const isLoggedIn = await ensureLoggedIn(location.pathname);
      if (!isLoggedIn) return; // 카카오로 이동 중이니 여기서 멈춤

      setIsCouponModalOpen(true);
    } catch (error) {
      // /auth/me/ 자체가 실패한 경우 (네트워크·서버 오류)
      // 로그인 화면으로 보내지 않고 그대로 둠 → 사용자가 다시 누르면 재시도
      console.warn("[auth] 로그인 상태 확인 실패", error);
    }
  };

  // ───────── 북마크 (명세서 ⑥) ─────────
  // 실제 로직(로그인 확인 → 아이콘 먼저 변경 → PUT/DELETE → 실패 시 되돌리기)은
  // store/SavedPromotionsProvider.jsx 의 toggleSave 에 있음. 홈·목록·저장 화면도 같은 함수를 씀
  // nextSaved: Bookmark 컴포넌트가 넘겨주는 "바뀔 값" (지금 false 면 true 가 들어옴)
  const handleToggleSave = async (nextSaved) => {
    if (!state.data) return;

    const result = await toggleSave(state.data.id, nextSaved);

    // 상세 화면에서만 추가로 하는 일:
    // 그 사이 비공개가 된 프로모션(404)이면 상세를 다시 불러와 "찾을 수 없어요" 화면으로
    if (result?.error?.status === 404) {
      setReloadKey((key) => key + 1);
    }
  };

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

  // 북마크 상태: 서버 응답의 is_saved 기본 (로그인 안 했으면 항상 false)
  // 이번 방문 중에 다른 화면에서 바꾼 적 있으면 그 값 (isSaved 가 알아서 골라줌)
  const promotion = { ...detail, saved: isSaved(detail.id, detail.is_saved) };

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
        onToggleSave={handleToggleSave}
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
          onClick={handleCouponClick}
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
