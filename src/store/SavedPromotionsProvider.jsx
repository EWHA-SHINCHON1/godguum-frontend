import { useCallback, useEffect, useMemo, useState } from "react";
import { MOCK_PROMOTIONS } from "../mocks/promotions";
import { SavedPromotionsContext } from "./savedPromotions";

const STORAGE_KEY = "godguum:saved-promotion-ids";

// "저장한 프로모션 목록" 저장 후 필요한 화면에 나눠주는 컴포넌트-> 화면을 그리지는 않고 데이터만 관리

function loadSavedIds() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // 저장소를 못 읽으면 mock 기본값으로 시작
  }
  return MOCK_PROMOTIONS.filter((promotion) => promotion.saved).map(
    (promotion) => promotion.id,
  );
}

export default function SavedPromotionsProvider({ children }) {
  const [savedIds, setSavedIds] = useState(loadSavedIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // 저장 실패해도 화면 상태는 유지
    }
  }, [savedIds]);

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const setSaved = useCallback((id, saved) => {
    setSavedIds((prev) => {
      const without = prev.filter((savedId) => savedId !== id);
      return saved ? [id, ...without] : without;
    });
  }, []);

  const value = useMemo(
    () => ({ savedIds, isSaved, setSaved }),
    [savedIds, isSaved, setSaved],
  );

  return (
    <SavedPromotionsContext.Provider value={value}>
      {children}
    </SavedPromotionsContext.Provider>
  );
}
