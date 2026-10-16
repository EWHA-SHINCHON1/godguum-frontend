import storyBackground from "../../assets/images/promotion/story-background.jpg";

/**
 * 프로모션 상세 > 가게 이야기 탭
 * 위·아래에 배경 이미지가 깔리고, 가운데에 가게 소개 글과 사진이 들어간다.
 */
export default function StoreStoryTab({ promotion }) {
  const { store } = promotion;

  return (
    <div className="relative overflow-hidden pt-[61px] pb-[88px]">
      <img
        src={storyBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1.5 h-[134px] w-full object-cover"
      />
      <img
        src={storyBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[134px] w-full object-cover"
      />

      <div className="relative mx-auto flex w-[326px] flex-col items-center gap-8 text-center text-fg">
        <p className="text-body3 font-medium tracking-[-0.012px] text-brand-strong">
          ABOUT
        </p>

        <h3 className="text-head1 font-semibold tracking-[-0.02px] whitespace-pre-line">
          {store.story_title}
        </h3>

        <div className="flex w-full flex-col">
          <p className="text-body2 font-medium tracking-[-0.014px]">
            {store.story}
          </p>

          <figure className="flex flex-col gap-[3px] py-5">
            <img
              src={store.story_image_url}
              alt="가게 소개하는 이미지이이잇"
              className="h-[260.8px] w-full object-cover"
            />
            <figcaption className="text-left text-caption1 font-normal tracking-[-0.011px] text-fg-muted">
              이미지 설명 캡션
            </figcaption>
          </figure>

          <div className="flex flex-col gap-[19.6px] text-body2 font-medium tracking-[-0.014px]">
            {store.story && (
              <p className="whitespace-pre-line">{store.story_after_image}</p>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between">
          {store.story_image_url && (
            <img
              src={store.story_image_url}
              alt={`${promotion.storeName} 가게 이야기 사진`}
              className="h-[260.8px] w-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
