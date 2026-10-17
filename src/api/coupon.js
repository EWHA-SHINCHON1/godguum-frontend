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
