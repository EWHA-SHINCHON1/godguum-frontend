import { useCallback, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import couponReceivedImage from "../../assets/icons/promotion/coupon-received.svg";
import characterSad from "../../assets/icons/character-sad.svg";
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
import { ensureLoggedIn, getMe, startKakaoLogin } from "../../api/auth";
import { getMyCoupon, issueCoupon } from "../../api/coupon";
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

/**
 * 하단 쿠폰 바에 무엇을 보여줄지 정하는 함수 (7·8단계)
 * @param raw       서버 상세 응답 그대로 (status 가 "active" 같은 영어 값)
 * @param myCoupon  { id, status } — 내가 이미 받은 쿠폰. 없으면 null
 *                  status 가 null 이면 "받은 건 확실한데 상태는 아직 조회 중"
 * @param isIssuing 발급 요청 중인지
 *
 * 우선순위: 비쿠폰형 → 이미 받은 쿠폰 → 발급 중 → 프로모션 상태
 * (이미 받은 쿠폰은 프로모션이 종료·소진돼도 볼 수 있어야 해서 프로모션 상태보다 먼저 확인)
 */
function getCouponBar(raw, myCoupon, isIssuing) {
  if (!raw.requires_coupon) {
    return { hasCoupon: false }; // 회색 "비쿠폰형"
  }

  if (myCoupon) {
    if (myCoupon.status === "used") {
      return { label: "사용 완료한 쿠폰이에요", inactive: true };
    }
    if (myCoupon.status === "expired") {
      return { label: "사용 기한이 지난 쿠폰이에요", inactive: true };
    }
    // available 또는 상태 조회 중(null)
    return { label: "내 쿠폰 보기" };
  }

  if (isIssuing) {
    return { label: "쿠폰 받는 중...", disabled: true };
  }

  switch (raw.status) {
    case "upcoming":
      return {
        label: "곧 쿠폰을 받을 수 있어요",
        inactive: true,
        disabled: true,
      };
    case "sold_out":
      return {
        label: "쿠폰이 모두 소진됐어요",
        inactive: true,
        disabled: true,
      };
    case "ended":
      return { label: "쿠폰 발급이 끝났어요", inactive: true, disabled: true };
    default:
      return { label: "쿠폰 발급받기" }; // active
  }
}

// 발급 실패 코드별 안내 문구 (명세서 ⑤-4-5)
// refresh: true → 상세를 다시 불러와서 남은 수량·상태(버튼)를 최신으로
const ISSUE_ERROR_MESSAGES = {
  PROMOTION_COUPON_NOT_REQUIRED: {
    title: "쿠폰 없이 참여하는 프로모션이에요",
    description: "매장에서 바로 혜택을 받을 수 있어요",
    refresh: true,
  },
  PROMOTION_NOT_ACTIVE: {
    title: "아직 쿠폰 발급 전이에요",
    description: "프로모션이 시작되면 다시 눌러주세요",
    refresh: true,
  },
  PROMOTION_ENDED: {
    title: "쿠폰 발급 기간이 끝났어요",
    description: "다음 프로모션을 기대해 주세요",
    refresh: true,
  },
  COUPON_SOLD_OUT: {
    title: "쿠폰이 모두 소진됐어요",
    description: "아쉽지만 준비된 쿠폰이 모두 나갔어요",
    refresh: true,
  },
  TOO_MANY_REQUESTS: {
    title: "잠시 후 다시 시도해 주세요",
    description: "짧은 시간에 요청이 너무 많았어요",
    refresh: false,
  },
};

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

  // "조용한" 상세 재조회: 화면을 "불러오는 중"으로 바꾸지 않고 데이터만 최신으로 교체
  // 쿠폰 발급 후 my_coupon_id·remaining_quantity·status 를 갱신할 때 사용 (명세서 ⑤-4-4)
  // (setReloadKey 를 쓰면 화면 전체가 깜빡여서 따로 만듦)
  // 실패해도 지금 보이는 화면은 그대로 둠
  const refreshDetail = useCallback(async () => {
    try {
      const data = await getPromotionDetail(promotionId);
      setState({ data, loading: false, error: null });
    } catch (error) {
      console.warn("[coupon] 발급 후 상세 재조회 실패", error);
    }
  }, [promotionId]);

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

  // ───────── 쿠폰 (명세서 ⑤, 작업순서 7·8단계) ─────────

  // 내가 이미 받은 쿠폰 { id, status }. 없으면 null
  const [myCoupon, setMyCoupon] = useState(null);
  // 발급 요청 중 (버튼 문구·비활성화용)
  const [isIssuing, setIsIssuing] = useState(false);
  // 연타 방지용 (state 는 다음 렌더링 때 바뀌어서, 아주 빠른 두 번째 클릭을 못 막을 수 있음 → ref)
  const isIssuingRef = useRef(false);
  // 쿠폰 관련 모달 내용. null 이면 닫힘
  // { image, title, description, cancelText, confirmText, onConfirm }
  const [couponModal, setCouponModal] = useState(null);

  const myCouponId = state.data?.my_coupon_id ?? null;

  // 7단계: 상세 응답에 my_coupon_id 가 있으면 → 쿠폰 상세를 조회해서 상태(available/used/expired) 확인
  // my_coupon_id 규칙 (명세서 ④): 비로그인이면 항상 null, 로그인했고 받은 적 있으면 쿠폰 UUID
  // → null 이라고 "비로그인"이라 단정하면 안 됨 (로그인했지만 아직 안 받은 경우도 null)
  useEffect(() => {
    if (!myCouponId) {
      setMyCoupon(null);
      return;
    }

    let isCurrent = true;

    // 상태를 받아오기 전까지는 "받은 건 확실, 상태는 모름(null)" → 버튼은 "내 쿠폰 보기"
    // 발급 직후처럼 이미 같은 쿠폰의 상태를 알고 있으면 그대로 유지
    setMyCoupon((prev) =>
      prev?.id === myCouponId ? prev : { id: myCouponId, status: null },
    );

    getMyCoupon(myCouponId)
      .then((coupon) => {
        if (isCurrent) setMyCoupon({ id: coupon.id, status: coupon.status });
      })
      .catch((error) => {
        // 조회 실패해도 "받은 쿠폰이 있다"는 건 확실하니 버튼은 "내 쿠폰 보기"로 둠
        console.warn(
          "[coupon] 내 쿠폰 상세 조회 실패",
          error.status,
          error.code,
          error,
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [myCouponId]);

  const closeCouponModal = () => setCouponModal(null);

  // 내 쿠폰함으로 이동 (쿠폰 상태에 맞는 탭으로)
  const goToMyCoupons = (status) => {
    setCouponModal(null);
    navigate(`/my/coupons?tab=${status || "available"}`);
  };

  // 발급 성공 모달 (201 새로 발급 / 200 이미 받은 쿠폰 을 구분해서 다른 문구)
  const showIssuedModal = (created, coupon) => {
    if (created) {
      setCouponModal({
        image: couponReceivedImage,
        title: "쿠폰을 받았어요!",
        description: "매장 방문 시 바로 사용할 수 있어요",
        cancelText: "취소",
        confirmText: "내 쿠폰 보기",
        onConfirm: () => goToMyCoupons(coupon.status),
      });
      return;
    }

    // created=false: 오류가 아님! 예전에 받은 쿠폰을 돌려준 것 (사용·만료됐을 수도 있음)
    const descriptions = {
      available: "내 쿠폰에서 확인하고 사용해 보세요",
      used: "이미 사용한 쿠폰이에요. 쿠폰은 한 번만 받을 수 있어요",
      expired: "사용 기한이 지난 쿠폰이에요. 쿠폰은 한 번만 받을 수 있어요",
    };
    setCouponModal({
      image: couponReceivedImage,
      title: "이미 받은 쿠폰이 있어요",
      description: descriptions[coupon.status] ?? descriptions.available,
      cancelText: "취소",
      confirmText: "내 쿠폰 보기",
      onConfirm: () => goToMyCoupons(coupon.status),
    });
  };

  // 발급 실패 처리 (명세서 ⑤-4-5)
  const handleIssueError = (error) => {
    // 세션 만료 → 다시 로그인 (끝나면 이 상세로 돌아옴)
    if (error.status === 401) {
      startKakaoLogin(location.pathname);
      return;
    }

    // 없음·비공개·비활성 매장 → 확인 누르면 상세를 다시 불러와 "찾을 수 없어요" 화면으로
    if (error.status === 404) {
      setCouponModal({
        image: characterSad,
        title: "발급할 수 없는 프로모션이에요",
        description: "프로모션이 종료되었거나 비공개로 바뀌었어요",
        cancelText: "",
        confirmText: "확인",
        onConfirm: () => {
          setCouponModal(null);
          setReloadKey((key) => key + 1);
        },
      });
      return;
    }

    const known = ISSUE_ERROR_MESSAGES[error.code];
    if (known) {
      if (known.refresh) refreshDetail(); // 버튼을 "소진/종료" 등 최신 상태로
      setCouponModal({
        image: characterSad,
        title: known.title,
        description: known.description,
        cancelText: "",
        confirmText: "확인",
        onConfirm: closeCouponModal,
      });
      return;
    }

    // 네트워크 끊김·서버 오류 등
    // 서버에서는 발급이 됐을 수도 있음 → 다시 누르면 200(기존 쿠폰)으로 돌아오니 안전
    console.warn("[coupon] 쿠폰 발급 실패", error.status, error.code, error);
    setCouponModal({
      image: characterSad,
      title: "쿠폰을 받지 못했어요",
      description: "잠시 후 다시 눌러주세요",
      cancelText: "",
      confirmText: "확인",
      onConfirm: closeCouponModal,
    });
  };

  // 쿠폰 바 클릭
  const handleCouponClick = async () => {
    if (!state.data) return;

    // 이미 받은 쿠폰이 있으면 발급 API 를 부를 필요 없이 쿠폰함으로
    if (myCoupon) {
      goToMyCoupons(myCoupon.status);
      return;
    }

    if (isIssuingRef.current) return; // 요청 중 연타 무시

    // 1) 로그인 확인 → 안 돼 있으면 카카오 로그인 (끝나면 이 상세로 복귀)
    //    로그인 후 자동으로 발급하지는 않음 → 돌아와서 한 번 더 누르면 발급
    try {
      const isLoggedIn = await ensureLoggedIn(location.pathname);
      if (!isLoggedIn) return;
    } catch (error) {
      // /auth/me/ 자체 실패 (네트워크·서버 오류) → 로그인 화면으로 보내지 않고 그대로
      console.warn("[auth] 로그인 상태 확인 실패", error);
      return;
    }

    // 2) 발급 요청 (요청 중에는 버튼 비활성화)
    isIssuingRef.current = true;
    setIsIssuing(true);

    try {
      let result;
      try {
        result = await issueCoupon(state.data.id);
      } catch (error) {
        // 403 CSRF_FAILED: 토큰이 없거나 오래됨 → /auth/me/ 로 새 토큰 받고 딱 한 번만 다시
        if (error.status !== 403) throw error;
        await getMe();
        result = await issueCoupon(state.data.id);
      }

      // 3) 버튼을 바로 "내 쿠폰 보기"로 + 안내 모달
      setMyCoupon({ id: result.coupon.id, status: result.coupon.status });
      showIssuedModal(result.created, result.coupon);

      // 4) 상세 재조회 → my_coupon_id·남은 수량·status 를 서버 값으로 갱신
      refreshDetail();
    } catch (error) {
      handleIssueError(error);
    } finally {
      isIssuingRef.current = false;
      setIsIssuing(false);
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
        {/* 상태별 문구·모양은 위의 getCouponBar 에서 결정 */}
        <CouponIssueBar
          {...getCouponBar(state.data, myCoupon, isIssuing)}
          onClick={handleCouponClick}
        />
      </div>

      {/* 쿠폰 발급 결과·오류 안내 (내용은 couponModal state 로 바뀜) */}
      <ConfirmModal
        open={couponModal !== null}
        image={couponModal?.image}
        title={couponModal?.title}
        description={couponModal?.description}
        cancelText={couponModal?.cancelText}
        confirmText={couponModal?.confirmText}
        onClose={closeCouponModal}
        onConfirm={couponModal?.onConfirm}
      />
    </main>
  );
}
