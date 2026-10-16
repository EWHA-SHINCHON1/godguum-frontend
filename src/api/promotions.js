import { api } from "./client";

export function getPromotions(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, typeof value === "boolean" ? String(value) : value);
  });

  const query = searchParams.toString();

  return api(`/promotions/${query ? `?${query}` : ""}`);
}

export function getPromotionDetail(promotionId) {
  return api(`/promotions/${promotionId}/`);
}

/* ───────── 북마크 ─────────
 * 로그인(세션) 필수 + CSRF 필수
 * CSRF 헤더(X-CSRFToken)는 client.js 의 api() 가 PUT·DELETE 요청에 자동으로 붙여줌
 *
 * 성공 응답
 *   PUT    → 201 { saved: true, created: true }   (새로 저장)
 *            200 { saved: true, created: false }  (이미 저장돼 있었음)
 *   DELETE → 200 { saved: false }                 (원래 없었어도 200)
 *
 * 실패 응답 (error.status / error.code)
 *   401 AUTHENTICATION_REQUIRED  로그인 안 됨 (세션 만료 등)
 *   403 CSRF_FAILED              CSRF 토큰 없음·불일치
 *   404 NOT_FOUND                비공개·없는 프로모션 (PUT 만)
 */

// 북마크 저장
export function savePromotionBookmark(promotionId) {
  return api(`/promotions/${promotionId}/bookmark/`, { method: "PUT" });
}

// 북마크 취소
export function removePromotionBookmark(promotionId) {
  return api(`/promotions/${promotionId}/bookmark/`, { method: "DELETE" });
}

// 내가 저장한 프로모션 목록 (로그인 필수, 비로그인이면 401)
// 응답 모양은 프로모션 목록과 같음: { count, next, previous, results: [...] }
// results 의 각 항목은 is_saved 가 항상 true, 최근 저장한 순서
export function getSavedPromotions() {
  return api("/me/saved-promotions/");
}

/* ───────── 조회·채널 클릭 이벤트  ───────── */

// crypto.randomUUID 는 https·localhost 에서만 동작함
// 휴대폰으로 http://192.168.x.x 처럼 접속해 테스트할 때를 대비해 대체 생성 함수를 둠
function createUuid() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // UUID 버전 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/**
 * 사용자 행동 1번 = 이벤트 객체 1개 (event_id 를 여기서 새로 발급)
 * @param {"view" | "channel_click"} eventType  반드시 소문자
 * @param {"instagram" | "naver"} [channel]     channel_click 일 때만
 */
export function createPromotionEvent(eventType, channel) {
  const event = { event_id: createUuid(), event_type: eventType };

  if (channel) {
    event.channel = channel;
  }

  return event;
}

const EVENT_MAX_RETRY = 2;

// 네트워크 끊김(status 없음)·서버 오류(5xx)만 재시도. 4xx(400·404·409·429)는 재시도해도 같은 결과
function isRetryable(error) {
  return !error.status || error.status >= 500;
}

/**
 * 이벤트 전송. 재시도할 때는 같은 event 객체(같은 event_id)를 그대로 다시 보냄
 * → 서버가 중복으로 판단해 created=false 로 응답하므로 두 번 집계되지 않음
 *
 * 성과 집계용이라 실패해도 화면에는 영향 없음: 에러를 밖으로 던지지 않음
 * TODO: 새로고침도 count돼서 로직 수정 필요할 듯..
 */
export async function sendPromotionEvent(promotionId, event) {
  for (let attempt = 0; attempt <= EVENT_MAX_RETRY; attempt += 1) {
    try {
      return await api(`/promotions/${promotionId}/events/`, {
        method: "POST",
        body: event,
        // 외부 링크로 이동하는 중에도 요청이 끊기지 않게 (채널 클릭에서 사용)
        keepalive: true,
      });
    } catch (error) {
      if (!isRetryable(error) || attempt === EVENT_MAX_RETRY) {
        if (import.meta.env.DEV) {
          console.warn("[promotion event] 전송 실패", event, error);
        }
        return null;
      }

      // 0.5초, 1초 간격으로 재시도
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  return null;
}
