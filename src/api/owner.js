import { API_BASE } from "./client";

export const OWNER_TOKEN_STORAGE_KEY = "godguum-owner-token";

export function getStoredOwnerToken() {
  try {
    return window.sessionStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeOwnerToken(ownerToken) {
  if (!ownerToken) {
    return;
  }

  try {
    window.sessionStorage.setItem(OWNER_TOKEN_STORAGE_KEY, ownerToken);
  } catch {
    // 저장소를 사용할 수 없으면 현재 진입에서만 토큰을 사용할 수 있다.
  }
}

export function clearOwnerToken() {
  try {
    window.sessionStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
  } catch {
    // 저장소 접근 실패 시에도 점주 인증 흐름은 중단하지 않는다.
  }
}

export function storeOwnerTokenFromHash() {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const ownerToken = hashParams.get("token");

  if (!ownerToken) {
    return null;
  }

  storeOwnerToken(ownerToken);
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`,
  );

  return ownerToken;
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

export async function ownerApi(path, ownerToken) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Owner ${ownerToken}`,
    },
    credentials: "omit",
    cache: "no-store",
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorData =
      responseBody && typeof responseBody === "object" ? responseBody.error : null;
    const error = new Error(
      errorData?.message ||
        (typeof responseBody === "string" && responseBody) ||
        response.statusText ||
        "점주 정보를 불러오지 못했습니다.",
    );

    error.status = response.status;
    error.code = errorData?.code;
    error.details = errorData?.details;

    throw error;
  }

  return responseBody;
}

export function getOwnerDashboard(ownerToken) {
  return ownerApi("/owner/dashboard/", ownerToken);
}

export function getOwnerPromotionStats(ownerToken, promotionId) {
  return ownerApi(
    `/owner/promotions/${encodeURIComponent(promotionId)}/stats/`,
    ownerToken,
  );
}
