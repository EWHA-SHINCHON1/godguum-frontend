import { api } from "./client";

/* ───────── 내 쿠폰 (명세서 ⑤·⑥) ─────────
 * 전부 로그인(세션) 필수. 비로그인이면 401 AUTHENTICATION_REQUIRED
 *
 * 목록 응답 모양 (한 페이지 20개)
 * {
 *   count: 3,            ← 전체 개수 (마이페이지 숫자는 이걸 씀. results.length 는 "이번 페이지" 개수라 X)
 *   next: null,          ← 다음 페이지 주소. null 이면 마지막 페이지
 *   previous: null,
 *   results: [
 *     {
 *       id: "c2f1...-uuid",            ← 쿠폰 id 는 숫자가 아니라 UUID 문자열
 *       status: "used",               ← available | used | expired
 *       issued_at: "2026-10-11T...",  ← 발급 일시
 *       expires_at: "2026-10-20T...",
 *       used_at: "2026-10-12T...",    ← 사용 일시 (안 썼으면 null)
 *       promotion: {
 *         id: 12, title: "휘낭시에 할인", benefit: "1,000원 할인",
 *         image_url: "https://...",
 *         store: { id: 3, name: "페어그라운드" }
 *       }
 *     }
 *   ]
 * }
 *
 * 정렬: "발급 최신순" 고정 (status=used 로 걸러도 "사용 최신순"이 아님 — 명세서 ⑥-9)
 */

/**
 * 내 쿠폰 목록
 * @param {object} [params]
 * @param {"available" | "used" | "expired"} [params.status]  생략하면 전체
 * @param {number} [params.page]                               생략하면 1페이지
 *
 * 사용 예)
 *   getMyCoupons()                         → 전체 쿠폰
 *   getMyCoupons({ status: "used" })       → 이용내역 (사용 완료)
 *   getMyCoupons({ status: "used", page: 2 })
 *
 * status 에 다른 값을 넣으면 400 INVALID_COUPON_STATUS
 */
export function getMyCoupons({ status, page } = {}) {
  const searchParams = new URLSearchParams();

  if (status) searchParams.set("status", status);
  if (page && page > 1) searchParams.set("page", String(page));

  const query = searchParams.toString();

  return api(`/me/coupons/${query ? `?${query}` : ""}`);
}

/**
 * 내 쿠폰 상세 — GET /me/coupons/{coupon_id}/   (7단계)
 * @param {string} couponId  쿠폰 UUID (프로모션 id 가 아님!)
 *
 * 응답은 쿠폰 객체 "그 자체" ({ coupon: ... } 로 감싸져 있지 않음)
 *   목록 항목과 같은 필드 + promotion.terms, promotion.store.address·business_hours·map_url
 *
 * 실패: 404 COUPON_NOT_FOUND (없는 쿠폰·다른 사람 쿠폰)
 */
export function getMyCoupon(couponId) {
  return api(`/me/coupons/${couponId}/`);
}

/**
 * 쿠폰 발급 — POST /promotions/{promotion_id}/coupons/   (8단계)
 * @param {number} promotionId  프로모션 id (정수)
 *
 * 로그인 + CSRF 필요 (CSRF 헤더는 api() 가 POST 에 자동으로 붙임)
 * 본문은 {} 고정. 누가 받는지는 서버가 세션(출입증)으로 판단
 *
 * 성공 응답 (둘 다 "성공"임!)
 *   201 { created: true,  coupon: { id, status, issued_at, expires_at } }  ← 새로 발급
 *   200 { created: false, coupon: { ... } }                                ← 이미 받은 쿠폰을 돌려줌
 *       → 사용·만료된 쿠폰이어도 새로 안 줌 (1인 1쿠폰). coupon.status 를 꼭 확인
 *
 * 실패 (error.status / error.code)
 *   404 PROMOTION_NOT_FOUND            없음·비공개·비활성 매장
 *   400 PROMOTION_COUPON_NOT_REQUIRED  쿠폰 없이 참여하는 프로모션
 *   409 PROMOTION_NOT_ACTIVE           시작 전
 *   409 PROMOTION_ENDED                발급 기간 종료
 *   409 COUPON_SOLD_OUT                소진
 *   429 TOO_MANY_REQUESTS              1분에 10번 넘게 누름 (error.retryAfter = 기다릴 초)
 *   401 AUTHENTICATION_REQUIRED / 403 CSRF_FAILED
 *
 * 1분 10회 제한이 있어서 자동 재시도는 하지 않음 (사용자가 다시 누르게)
 */
export function issueCoupon(promotionId) {
  return api(`/promotions/${promotionId}/coupons/`, {
    method: "POST",
    body: {},
  });
}

/**
 * 쿠폰 사용 (PIN) — POST /me/coupons/{coupon_id}/use/   (명세서 ⑤-8)
 * @param {string} couponId  쿠폰 UUID
 * @param {string} pin       매장 직원이 입력한 4자리. 반드시 "문자열" ("0428" 의 앞자리 0 유지)
 *                           → Number()·parseInt() 로 바꾸면 안 됨
 *
 * 이름을 useCoupon 으로 안 한 이유:
 *   React 는 use 로 시작하는 함수를 "훅"으로 취급해서, 클릭 처리 함수 안에서 부르면 규칙 위반 경고가 뜸
 *
 * 성공 200: { coupon: { id, status: "used", used_at, ... } }  ← 목록 쿠폰과 같은 모양
 *
 * 실패 (서버가 이 순서로 검사)
 *   404 COUPON_NOT_FOUND     없음·다른 사람 쿠폰
 *   400 INVALID_PIN_FORMAT   4자리 숫자 문자열이 아님
 *   409 COUPON_ALREADY_USED  이미 사용
 *   409 COUPON_EXPIRED       사용 기한 지남
 *   409 PIN_NOT_SET          매장 PIN 미설정
 *   429 PIN_LOCKED           잠금 중   → error.details.retry_after_seconds
 *   400 INVALID_PIN          PIN 틀림  → error.details.remaining_attempts
 *
 * 주의: 자동 재시도 금지! 응답을 못 받아도 서버에선 사용 처리됐을 수 있음
 *       → 실패 시 getMyCoupon 으로 상태부터 확인 (명세서 ⑤-10)
 * PIN 은 저장하거나 console 에 찍지 않음
 */
export function redeemCoupon(couponId, pin) {
  return api(`/me/coupons/${couponId}/use/`, {
    method: "POST",
    body: { pin },
  });
}
