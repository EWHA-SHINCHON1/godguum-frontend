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

/* ───────── 조회·채널 클릭 이벤트 (명세서 4-6, 7) ───────── */

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

// 객체 리터럴 { 키: 값 }: 서버에 보낼 JSON 모양을 그대로 만듦
// crypto.randomUUID : 랜덤 난수 생성
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
 * -> createPromotionEvent로 만든 객체 하나를 sendPromotionEvent 안의 재시도에서 계속 쓴다.
 * -> 서버가 중복으로 판단해 created=false 로 응답하므로 두 번 집계되지 않음
 *
 * 성과 집계용이라 실패해도 화면에는 영향 없음: 에러를 밖으로 던지지 않음
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
