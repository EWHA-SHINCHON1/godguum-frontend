import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Header } from "../../components/common";
import StoreInfoCard from "../../components/stores/StoreInfoCard";
import StoreMenuCard from "../../components/stores/StoreMenuCard";
import { getStoreDetail } from "../../api/store";

// 응답 category 값 → 화면 표시용 라벨
const CATEGORY_LABEL = {
  bakery_cafe: "카페·디저트",
  restaurant: "식당",
};

// API 응답을 화면 컴포넌트가 쓰는 형태로 변환
// 빈 문자열로 오는 링크는 목록에서 빼서 클릭 가능한 빈 버튼이 생기지 않게 함
function toStoreView(store) {
  const links = [
    { label: "인스타그램 바로가기", url: store.instagram_url },
    { label: "네이버 바로가기", url: store.naver_url },
  ].filter((link) => link.url);

  return {
    id: store.id,
    name: store.name,
    category: CATEGORY_LABEL[store.category] ?? "",
    image: store.image_url,
    hours: store.business_hours,
    location: store.address,
    mapUrl: store.map_url,
    links,
    // 응답 menus 는 이미 sort_order 오름차순. 메뉴에 id 가 없어서 key 용으로 sort_order 사용
    menus: store.menus.map((menu) => ({
      id: menu.sort_order,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      image: menu.image_url,
    })),
  };
}

/** 2-2-3 매장정보 */
export default function StoreInfoPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  // "다시 시도" 버튼을 누르면 값이 바뀌면서 매장을 다시 조회
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setState({ data: null, loading: true, error: null });

    getStoreDetail(storeId)
      .then((data) => {
        if (isCurrent) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (isCurrent) setState({ data: null, loading: false, error });
      });

    return () => {
      isCurrent = false;
    };
  }, [storeId, reloadKey]);

  // 로딩 → 404 → 기타 오류 순서로 검사 (명세서 8. 오류 처리)
  if (state.loading || state.error || !state.data) {
    const isNotFound = state.error?.status === 404;

    let message = "불러오는 중이에요";
    let action = null;

    if (isNotFound) {
      // 없음·비활성 매장
      message = "매장을 찾을 수 없어요";
    } else if (state.error) {
      // 서버·네트워크 오류
      message = "매장 정보를 불러오지 못했어요";
      action = (
        <Button
          variant="secondary"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          다시 시도
        </Button>
      );
    }

    return (
      <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
        <Header
          title="매장정보"
          onBack={() => navigate(-1)}
          className="bg-transparent"
        />
        <div className="flex flex-col items-center gap-4 py-20">
          <p
            className="text-center text-body2 font-medium text-fg-muted"
            role={state.error ? "alert" : "status"}
          >
            {message}
          </p>
          {action}
        </div>
      </main>
    );
  }

  const store = toStoreView(state.data);

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-8">
      <Header
        title="매장정보"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      {store.image && (
        <img
          src={store.image}
          alt={`${store.name} 매장 사진`}
          className="aspect-square w-full object-cover"
        />
      )}

      <div className="mt-4 flex flex-col gap-5 px-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-[5px]">
            <h2 className="text-head1 font-semibold whitespace-nowrap text-fg">
              {store.name}
            </h2>
            {store.category && (
              <span className="inline-flex items-center justify-center rounded-full bg-brand-subtle px-3 py-1 text-body3 font-medium whitespace-nowrap text-brand-contrast">
                {store.category}
              </span>
            )}
          </div>

          <StoreInfoCard store={store} />

          {/* 지도 이미지는 API 에 없어서 링크 버튼으로 대체. 지도 클릭은 이벤트 집계 대상 아님 */}
          {store.mapUrl && (
            <a
              href={store.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center rounded-lg border-[0.5px] border-line bg-surface text-body2 font-semibold text-fg"
            >
              지도에서 위치 보기
            </a>
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
          {store.menus.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {store.menus.map((menu) => (
                <li key={menu.id}>
                  <StoreMenuCard menu={menu} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-body3 font-medium text-fg-muted">
              등록된 메뉴가 없어요
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
