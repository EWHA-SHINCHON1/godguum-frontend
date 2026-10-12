import { createContext, useContext } from "react";

export const SavedPromotionsContext = createContext(null);

export function useSavedPromotions() {
  const context = useContext(SavedPromotionsContext);
  if (!context) {
    throw new Error("useSavedPromotions는 SavedPromotionsProvider 안에서만 쓸 수 있어요");
  }
  return context;
}
