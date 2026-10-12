import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import savedEmptyImage from "../../assets/icons/bookmark/bookmark-empty.svg";
import { Button, GNB, TopBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";
import { MOCK_PROMOTIONS } from "../../mocks/promotions";
import { useSavedPromotions } from "../../store/savedPromotions";

export default function SavedPromotionsPage() {
  const navigate = useNavigate();
  const { savedIds, setSaved } = useSavedPromotions();

  const savedPromotions = useMemo(
    () =>
      savedIds
        .map((id) => MOCK_PROMOTIONS.find((promotion) => promotion.id === id))
        .filter(Boolean)
        .map((promotion) => ({ ...promotion, saved: true })),
    [savedIds],
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-28">
      <TopBar onLogoClick={() => navigate("/home")} />

      {savedPromotions.length > 0 ? (
        <ul
          className="flex flex-col gap-3 px-5 pt-3"
          aria-label="저장한 프로모션"
        >
          {savedPromotions.map((promotion) => (
            <li key={promotion.id}>
              <PromotionListCard
                promotion={promotion}
                onClick={() => navigate(`/promotions/${promotion.id}`)}
                onToggleSave={(saved) => setSaved(promotion.id, saved)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center px-5 pt-[26px]">
          <img src={savedEmptyImage} alt="" width={239} height={146} />
          <div className="flex w-full flex-col items-center gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-head1 font-semibold tracking-[-0.02px] text-fg">
                아직 저장한 프로모션이 없어요
              </h1>
              <p className="text-body2 font-medium tracking-[-0.014px] text-fg-muted">
                마음에 드는 프로모션을 저장하고
                <br />
                나중에 다시 확인해보세요!
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-[180px]"
              onClick={() => navigate("/promotions")}
            >
              프로모션 둘러보기
            </Button>
          </div>
        </section>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="home"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
