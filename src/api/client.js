export const API_BASE = "https://api.godguum.com/api/v1";

function getCsrfToken() {
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
    body: body === undefined || body === null ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorData =
      responseBody && typeof responseBody === "object" ? responseBody.error : null;
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

  return responseBody;
}
