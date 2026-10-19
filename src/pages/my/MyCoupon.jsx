import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, SegmentedTabs } from "../../components/common";
import CouponCard from "../../components/coupon/CouponCard";
import { getMyCoupons } from "../../api/coupon";
import { formatSeoulDate, getCouponExpirationDday } from "../../utils/date";

const TABS = [
  {
    value: "available",
    label: "사용 가능",
    empty: "사용 가능한 쿠폰이 없어요",
  },
  { value: "used", label: "사용 완료", empty: "사용 완료한 쿠폰이 없어요" },
  { value: "expired", label: "기간 만료", empty: "기간 만료된 쿠폰이 없어요" },
];

/**
 * 서버 쿠폰 1개 → CouponCard(안의 PromotionListCard)가 쓰는 모양으로 변환
 * 쿠폰 목록 응답엔 프로모션 기간(starts_at·ends_at)이 없음
 * → 쿠폰에서 중요한 "언제까지 쓸 수 있는지(expires_at)"를 기간 자리에 보여줌
 *   (명세서 ⑤-6-2: 받은 쿠폰은 프로모션 종료일이 아니라 쿠폰의 expires_at 기준)
 */
function toCouponCard(coupon) {
  const expires = formatSeoulDate(coupon.expires_at);

  return {
    id: coupon.id,
    status: coupon.status,
    promotionId: coupon.promotion?.id,
    promotion: {
      storeName: coupon.promotion?.store?.name ?? "",
      title: coupon.promotion?.title ?? "",
      image: coupon.promotion?.image_url || undefined, // 없으면 카드의 기본 이미지
      period:
        coupon.status === "used"
          ? `${formatSeoulDate(coupon.used_at)} 사용`
          : `~ ${expires} 까지 사용`,
      // 사용 가능한 쿠폰만 D-day 표시 (기간 만료 카드는 CouponCard 가 "기간 만료"로 덮어씀)
      dDay:
        coupon.status === "available"
          ? getCouponExpirationDday(coupon.expires_at)
          : "",
    },
  };
}

/**
 * 4-3-1 / 4-3-2 내 쿠폰 (사용 가능 · 사용 완료 · 기간 만료)  — 명세서 ⑤-5
 * GET /me/coupons/?status=available|used|expired&page=N
 *
 * 선택한 탭은 ?tab= 으로 들고 있어서, 쿠폰 발급 후 "내 쿠폰 보기"로 올 때 탭을 지정할 수 있고
 * 쿠폰 사용 후 돌아와도 탭이 유지된다.
 *
 * - 탭 옆 숫자 (n) : 상태별 목록 API 의 count (results.length 아님)
 * - 정렬 : 서버 기준 "최근 발급순" (프론트에서 다시 정렬하지 않음)
 * - 탭을 바꾸면 1페이지부터 다시 조회 (명세서 ⑤-5 "상태 탭 변경 시 페이지 1로")
 */
export default function MyCoupon() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((item) => item.value === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "available";

  // 탭 숫자: { available: 3, used: 1, expired: null } — null 은 아직 모름(불러오는 중·실패)
  const [counts, setCounts] = useState({
    available: null,
    used: null,
    expired: null,
  });

  // 현재 탭 목록
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "success"
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // 비로그인(401)이면 로그인 화면으로
  const redirectIfLoggedOut = useCallback(
    (error) => {
      if (error?.status === 401) {
        navigate("/login", { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  // 탭 숫자 3개: 화면에 들어올 때 + 다시 시도할 때 한 번에 조회
  useEffect(() => {
    let isCurrent = true;

    Promise.allSettled(
      TABS.map((item) => getMyCoupons({ status: item.value })),
    ).then((results) => {
      if (!isCurrent) return;
      const next = {};
      TABS.forEach((item, index) => {
        const result = results[index];
        next[item.value] =
          result.status === "fulfilled" ? (result.value?.count ?? null) : null;
      });
      setCounts(next);
    });

    return () => {
      isCurrent = false;
    };
  }, [retryKey]);

  // 현재 탭의 1페이지 조회 (탭이 바뀔 때마다)
  useEffect(() => {
    let isCurrent = true;

    setStatus("loading");
    setCoupons([]);
    setNextPage(null);

    getMyCoupons({ status: tab, page: 1 })
      .then((data) => {
        if (!isCurrent) return;
        setCoupons((data.results ?? []).map(toCouponCard));
        setNextPage(data.next ? 2 : null);
        // 목록을 받았으니 이 탭 숫자도 최신 count 로 맞춤
        setCounts((prev) => ({ ...prev, [tab]: data.count ?? prev[tab] }));
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (redirectIfLoggedOut(error)) return;
        console.warn(
          "[coupon] 내 쿠폰 목록 조회 실패",
          error.status,
          error.code,
          error,
        );
        setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [tab, retryKey, redirectIfLoggedOut]);

  // 20개 넘을 때 "더보기"
  const handleLoadMore = async () => {
    if (!nextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = await getMyCoupons({ status: tab, page: nextPage });
      setCoupons((prev) => {
        const seen = new Set(prev.map((coupon) => coupon.id));
        const added = (data.results ?? [])
          .filter((coupon) => !seen.has(coupon.id))
          .map(toCouponCard);
        return [...prev, ...added];
      });
      setNextPage(data.next ? nextPage + 1 : null);
    } catch (error) {
      if (redirectIfLoggedOut(error)) return;
      console.warn(
        "[coupon] 다음 페이지 조회 실패",
        error.status,
        error.code,
        error,
      );
      alert("쿠폰을 더 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const tabItems = TABS.map((item) => ({
    value: item.value,
    // 숫자를 모르면 괄호 없이 이름만 (0 으로 착각하지 않게)
    label:
      counts[item.value] === null
        ? item.label
        : `${item.label} (${counts[item.value]})`,
  }));

  const emptyText = TABS.find((item) => item.value === tab).empty;

  let content;
  if (status === "loading") {
    content = (
      <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
        쿠폰을 불러오는 중이에요
      </p>
    );
  } else if (status === "error") {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-body2 font-medium text-fg-muted">
          쿠폰을 불러오지 못했어요
        </p>
        <button
          type="button"
          onClick={() => setRetryKey((key) => key + 1)}
          className="rounded-full bg-brand-weak px-4 py-2 text-body3 font-semibold text-brand-strong"
        >
          다시 시도
        </button>
      </div>
    );
  } else if (coupons.length === 0) {
    content = (
      <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
        {emptyText}
      </p>
    );
  } else {
    content = (
      <>
        <ul className="flex flex-col gap-3 px-5 pt-8" aria-label="쿠폰 목록">
          {coupons.map((coupon) => (
            <li key={coupon.id}>
              <CouponCard
                coupon={coupon}
                onClick={() => navigate(`/promotions/${coupon.promotionId}`)}
                // 사용하기 → PIN 입력 화면 (쿠폰 UUID 로 이동)
                onUse={() => navigate(`/my/coupons/${coupon.id}/use`)}
              />
            </li>
          ))}
        </ul>

        {nextPage && (
          <div className="flex justify-center px-5 pt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-full bg-brand-weak px-4 py-2 text-body3 font-semibold text-brand-strong disabled:opacity-50"
            >
              {isLoadingMore ? "불러오는 중..." : "더보기"}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-10">
      <Header
        title="내 쿠폰"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      <SegmentedTabs
        variant="underline"
        items={tabItems}
        value={tab}
        onChange={(next) => setSearchParams({ tab: next }, { replace: true })}
      />

      {content}
    </main>
  );
}
