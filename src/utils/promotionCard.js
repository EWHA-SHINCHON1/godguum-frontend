import { formatSeoulDate, getDday } from "./date";

/**
 * 프로모션 API 응답 1개 → PromotionListCard 가 쓰는 모양으로 변환
 * 전체 목록(PromotionListPage)과 저장 목록(SavedPromotionsPage)이 같이 씀
 *
 * @param promotion  서버 응답의 프로모션 객체 (목록 API 의 results 항목)
 * @param isSaved    useSavedPromotions() 의 isSaved 함수
 */
export function toListCard(promotion, isSaved) {
  return {
    id: promotion.id,
    title: promotion.title,
    storeName: promotion.store?.name ?? "",
    image: promotion.image_url,
    period: `${formatSeoulDate(promotion.starts_at)} ~ ${formatSeoulDate(promotion.ends_at)}`,
    dDay: getDday(promotion.ends_at),
    // 서버 is_saved 를 기본으로, 이번 방문 중 바꾼 값이 있으면 그 값
    saved: isSaved(promotion.id, promotion.is_saved),
  };
}
