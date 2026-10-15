import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/common";
import StoreInfoCard from "../../components/stores/StoreInfoCard";
import StoreMenuCard from "../../components/stores/StoreMenuCard";
import { getStoreDetail, MOCK_STORES } from "../../mocks/stores";

/** 2-2-3 매장정보 */
export default function StoreInfoPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  // TODO: 라우트 연결 후 storeId 로만 조회 (지금은 파라미터 없으면 첫 매장 표시)
  const store = storeId ? getStoreDetail(storeId) : MOCK_STORES[0];

  if (!store) {
    return (
      <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
        <Header
          title="매장정보"
          onBack={() => navigate(-1)}
          className="bg-transparent"
        />
        <p className="py-20 text-center text-body2 font-medium text-fg-muted">
          매장을 찾을 수 없어요
        </p>
      </main>
    );
  }

  const mapLink = store.links?.find((link) => link.url.includes("naver"))?.url;

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-8">
      <Header
        title="매장정보"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      <img
        src={store.image}
        alt={`${store.name} 매장 사진`}
        className="aspect-square w-full object-cover"
      />

      <div className="mt-4 flex flex-col gap-5 px-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-[5px]">
              <h2 className="text-head1 font-semibold whitespace-nowrap text-fg">
                {store.name}
              </h2>
              <span className="inline-flex items-center justify-center rounded-full bg-brand-subtle px-3 py-1 text-body3 font-medium whitespace-nowrap text-brand-contrast">
                {store.category}
              </span>
            </div>
            <p className="text-body3 font-medium text-fg-muted">
              {store.description}
            </p>
          </div>

          <StoreInfoCard store={store} />

          {mapLink ? (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${store.name} 지도에서 보기`}
              className="block h-[100px] w-full overflow-hidden rounded-lg bg-surface"
            >
              <img
                src={store.mapImage}
                alt=""
                className="size-full object-cover"
              />
            </a>
          ) : (
            <div className="h-[100px] w-full overflow-hidden rounded-lg bg-surface">
              <img
                src={store.mapImage}
                alt={`${store.name} 위치 지도`}
                className="size-full object-cover"
              />
            </div>
          )}
        </div>

        <section
          aria-labelledby="store-menu-title"
          className="flex flex-col gap-3"
        >
          <h2
            id="store-menu-title"
            className="text-body1 leading-[1.5] font-semibold text-black"
          >
            대표메뉴
          </h2>
          <ul className="flex flex-col gap-3">
            {store.menus.map((menu) => (
              <li key={menu.id}>
                <StoreMenuCard menu={menu} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
