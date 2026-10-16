import { api } from "./client";

export function getStoreDetail(storeId) {
  return api(`/stores/${storeId}/`);
}
