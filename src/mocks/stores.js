// TODO: API 연동 전 mock 데이터 (2-2-3 매장정보에서 사용)
import seongmuCafeImage from "../assets/images/stores/cafe.png";
import seongmuMapImage from "../assets/images/stores/map.png";
import madeleineImage from "../assets/images/owner/figma-raw-2.png";

export const MOCK_STORES = [
  {
    id: 1,
    storeId: 1,
    name: "성무",
    category: "카페·디저트",
    description: "좋은 재료로 만드는 따뜻한 디저트와 커피, 성무입니다.",
    image: seongmuCafeImage,
    mapImage: seongmuMapImage,
    hours: "월~토 11:00~20:00 · 라스트오더 19:30\n매주 일요일 휴무",
    location:
      "서울 서대문구 이화여대길 52-33 지하 1층\n이대역 2번 출구에서 약 331m",
    links: [
      {
        label: "인스타그램 바로가기",
        url: "https://www.instagram.com/seongmoo.workshop/",
      },
      { label: "네이버지도 바로가기", url: "https://naver.me/GWWGpJyk" },
    ],
    menus: [
      {
        id: 1,
        name: "브라운 바닐라 빈 마들렌",
        description: "버터를 짙게 태워 얻어낸 농밀한 바닐라 헤이즐넛",
        price: 3800,
        image: madeleineImage,
      },
      {
        id: 2,
        name: "브라운 바닐라 빈 마들렌",
        description: "버터를 짙게 태워 얻어낸 농밀한 바닐라 헤이즐넛",
        price: 3800,
        image: madeleineImage,
      },
    ],
  },
];

export function getStoreDetail(id) {
  return MOCK_STORES.find((store) => String(store.id) === String(id)) ?? null;
}

export function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}
