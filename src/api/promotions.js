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
