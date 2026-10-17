export const API_BASE = "https://api.godguum.com/api/v1";

/**
 * CSRF 토큰 (PUT·POST·DELETE 요청의 X-CSRFToken 헤더에 붙이는 값)
 *
 * 1순위: 서버가 /auth/me/ 응답 본문에 담아준 csrf_token
 *   → localhost 처럼 api.godguum.com 과 다른 주소에서 띄운 프론트는
 *     csrftoken 쿠키(Domain=.godguum.com)를 JS 로 읽을 수 없어서, 응답 본문으로 받아 둠
 * 2순위: csrftoken 쿠키 (같은 도메인에 배포된 프론트에서는 이것도 읽힘)
 *
 * /auth/me/ 는 로그인 확인(ensureLoggedIn)할 때 항상 먼저 불리므로
 * 북마크·쿠폰 같은 쓰기 요청 전에는 이 값이 채워져 있음
 * 로그인하면 서버가 토큰을 새로 바꾸는데, 로그인 후 페이지가 새로 열리면서 me 를 다시 부르므로 최신 값으로 갱신됨
 */
let csrfTokenFromServer = null;

function getCsrfToken() {
  if (csrfTokenFromServer) {
    return csrfTokenFromServer;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api(path, options = {}) {
  const { method = "GET", headers, body, ...restOptions } = options;
  const requestMethod = method.toUpperCase();
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined && body !== null) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(requestMethod)) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      requestHeaders.set("X-CSRFToken", csrfToken);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    method: requestMethod,
    headers: requestHeaders,
    credentials: "include",
    body:
      body === undefined || body === null ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorData =
      responseBody && typeof responseBody === "object"
        ? responseBody.error
        : null;
    const error = new Error(
      errorData?.message ||
        (typeof responseBody === "string" && responseBody) ||
        response.statusText ||
        "API 요청에 실패했습니다.",
    );

    error.status = response.status;
    error.code = errorData?.code;
    error.details = errorData?.details;
    error.retryAfter = response.headers.get("Retry-After");

    throw error;
  }

  // 응답에 csrf_token 이 들어 있으면(/auth/me/) 기억해 두고 다음 쓰기 요청에 사용
  if (
    responseBody &&
    typeof responseBody === "object" &&
    typeof responseBody.csrf_token === "string"
  ) {
    csrfTokenFromServer = responseBody.csrf_token;
  }

  return responseBody;
}
