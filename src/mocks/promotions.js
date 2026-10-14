// TODO: API 연동 전 mock 데이터 (전체 프로모션 목록 · 프로모션 상세에서 함께 사용)
// home 에서도 해당 mock 데이터를 사용하도록 수정했습니다. 나중에 promotion mock data만 api 호출로 수정하면 됨
import trayImage from "../assets/images/owner/figma-raw-2.png";
import dessertImage from "../assets/images/owner/owner-performance-promotion.png";

export const MOCK_PROMOTIONS = [
  {
    id: 1,
    storeName: "성무",
    title: "성무 취향 발견 주간",
    period: "26.11.06 ~ 26.11.08",
    dDay: "D-3",
    status: "진행중",
    saved: false,
    hasCoupon: true,
  },
  {
    id: 2,
    storeName: "카페 오브제",
    title: "아메리카노 1000원 할인",
    period: "26.11.01 ~ 26.11.05",
    dDay: "D-3",
    status: "진행중",
    saved: true,
    hasCoupon: true,
  },
  {
    id: 3,
    storeName: "브레드 홀릭",
    title: "소금빵 1+1",
    period: "26.10.28 ~ 26.11.03",
    dDay: "D-DAY",
    status: "오늘 마감",
    saved: true,
    hasCoupon: false,
  },
  {
    id: 4,
    storeName: "커피리브레",
    title: "신메뉴 무료 업그레이드",
    period: "26.11.10 ~ 26.11.16",
    dDay: "D-7",
    status: "곧 시작",
    saved: true,
    hasCoupon: true,
  },
  {
    id: 5,
    storeName: "달콤 베이커리",
    title: "케이크 10% 할인",
    period: "26.11.02 ~ 26.11.09",
    dDay: "D-5",
    status: "진행중",
    saved: true,
    hasCoupon: true,
  },
  {
    id: 6,
    storeName: "카페 올베르",
    title: "수업 끝나고 달달하게",
    period: "26.11.03 ~ 26.11.07",
    dDay: "D-4",
    status: "진행중",
    saved: true,
    hasCoupon: false,
  },
  {
    id: 7,
    storeName: "오후의 디저트",
    title: "전 메뉴 15% 할인",
    period: "26.10.30 ~ 26.11.03",
    dDay: "D-DAY",
    status: "오늘 마감",
    saved: false,
    hasCoupon: true,
  },
];

// 상세 정보는 아직 성무 데이터 하나만 있어서, 모든 프로모션이 이 내용을 같이 쓴다.
const SEONGMU_DETAIL = {
  image: trayImage,
  condition: {
    title: "디저트 2종 세트 구매 시 사용 가능",
    note: "(1인 1회 · 매장 결제 및 픽업)",
  },
  info: {
    headline: "두 가지 맛, 나의 취향은?",
    paragraphs: [
      "성무의 대표 디저트 마들렌과 티그레 2종 세트를\n특별가 8,900원에 즐겨보세요",
      "두 디저트를 천천히 맛보고,\n더 마음에 들었던 제품과 그 이유를 들려주세요.\n여러분의 의견은 성무에 전달돼요.",
    ],
    image: dessertImage,
    steps: [
      "디저트 세트 특별가 쿠폰을 발급받아요",
      "매장에서 쿠폰을 보여주고 결제·수령해요",
      "두 제품을 맛본 뒤 온라인 설문에 참여해요",
    ],
    summary: {
      period: "26. 11. 06 ~ 26. 11. 08",
      product: "마들렌 + 티그레 2종 세트",
      price: "8,900원",
      condition: "1인 1회 · 매장 결제 및 픽업",
    },
  },
  story: {
    eyebrow: "ABOUT SEOUNGMOO",
    headline: "익숙한 재료에서 발견하는\n새로운 맛, 성무",
    question: "미소된장과 초콜릿을 함께 쓰면 어떤 맛이 날까요?",
    mainPhoto: {
      src: dessertImage,
      caption: "미소된장, 메밀, 초콜렛으로 만든 쿠키",
    },
    paragraphs: [
      "성무의 사장님은 익숙한 재료를\n조금 낯설게 조합하는 일을 좋아합니다.",
      "새로운 재료와 조합을 고민하며,\n직접 만들고 싶은 디저트를 하나씩 선보이고 있어요.",
      "가게를 찾은 학생들이 긴 글로 방문 후기를\n남겨준 일도 있었어요.\n사장님이 건넨 작은 과자와 학생들이 보내준 반응이\n서로에게 반가운 기억으로 남았습니다.",
      "이번에는 여러분이\n성무의 두 가지 디저트를 만나볼 차례예요.",
      "맛과 식감을 비교해보고,\n더 마음에 드는 디저트를 찾아보세요.",
      "어떤 맛이 좋았는지, 어떤 점이 아쉬웠는지\n여러분의 솔직한 의견을 성무에 전해주세요.",
    ],
    photos: [trayImage, dessertImage],
  },
};

export function getPromotionDetail(id) {
  const promotion = MOCK_PROMOTIONS.find(
    (item) => String(item.id) === String(id),
  );
  if (!promotion) return null;
  return { ...SEONGMU_DETAIL, ...promotion };
}
