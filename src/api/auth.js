import { API_BASE, api } from "./client";

export function getMe() {
  return api("/auth/me/");
}

export function startKakaoLogin(next = "/") {
  window.location.assign(
    `${API_BASE}/auth/kakao/start/?next=${encodeURIComponent(next)}`,
  );
}

/**
 * 로그인 확인 함수
 * 로그인이 필요한 버튼(쿠폰 받기·기존 쿠폰 보기·북마크)을 누르기 직전에 호출
 *
 * - 로그인돼 있으면 → true 를 돌려줌 → 버튼 원래 동작을 이어서 실행
 * - 로그인 안 돼 있으면 → 카카오 로그인 페이지로 이동시키고 false 를 돌려줌
 *   → 로그인이 끝나면 서버가 nextPath 로 다시 보내줌 (예: "/promotions/12")
 *
 * nextPath 규칙 (백엔드 users/views.py 의 ALLOWED_NEXT_PATTERNS):
 *   "/" 또는 "/promotions/숫자" 만 허용. 그 외 경로는 서버가 "/" 로 바꿔버림
 *
 * 로그인 여부를 my_coupon_id 로 판단하면 안 됨 (명세서 ④-4-2):
 *   null 은 "비로그인" 일 수도, "로그인했지만 쿠폰 안 받음" 일 수도 있어서 구분이 안 됨
 *
 * getMe() 가 네트워크 오류 등으로 실패하면 에러를 그대로 던짐
 *   → 로그인 안 된 걸로 착각해서 엉뚱하게 로그인 화면으로 보내지 않도록
 *   → 호출하는 쪽에서 try/catch 로 처리
 */
export async function ensureLoggedIn(nextPath) {
  // 서버에 "나 누구야?" 물어보기
  // 비로그인이어도 에러가 아니라 200 + { is_authenticated: false } 로 옴
  // (덤으로 POST/PUT/DELETE 때 필요한 csrftoken 쿠키도 이 응답에서 내려옴)
  const me = await getMe();

  if (!me.is_authenticated) {
    // 페이지 자체가 카카오로 넘어가므로 이 줄 이후 코드는 사실상 실행되지 않음
    startKakaoLogin(nextPath);
    return false;
  }

  return true;
}

/**
 * 로그아웃 — POST /auth/logout/  (명세서 ②)
 * - 서버가 세션(출입증)을 지워줌. 카카오 연결 해제(탈퇴)와는 다름
 * - 성공하면 204 (본문 없음) → api() 가 null 을 돌려줌
 * - 이미 로그아웃된 상태여도 204
 * - 로그인 상태에서는 CSRF 헤더 필요 → api() 가 POST 에 자동으로 붙여줌
 *   (토큰은 client.js 가 /auth/me/ 응답에서 기억해 둔 값)
 *
 * 실패하면(403 CSRF_FAILED, 네트워크 오류 등) 에러를 그대로 던짐 → 호출하는 쪽에서 처리
 */
export function logout() {
  return api("/auth/logout/", { method: "POST" });
}
