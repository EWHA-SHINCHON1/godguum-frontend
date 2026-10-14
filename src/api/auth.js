import { API_BASE, api } from "./client";

export function getMe() {
  return api("/auth/me/");
}

export function startKakaoLogin(next = "/") {
  window.location.assign(
    `${API_BASE}/auth/kakao/start/?next=${encodeURIComponent(next)}`,
  );
}
