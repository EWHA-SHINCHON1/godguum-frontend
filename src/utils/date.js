// 날짜 가공 함수 분리 (재사용 위해)

const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSeoulDayValue(date) {
  const parts = seoulDateFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return Date.UTC(values.year, values.month - 1, values.day);
}

function getLegacyDday(endsAt) {
  const endDate = new Date(endsAt);

  if (!endsAt || Number.isNaN(endDate.getTime())) {
    return "";
  }

  const remainingDays = Math.round(
    (getSeoulDayValue(endDate) - getSeoulDayValue(new Date())) /
      (1000 * 60 * 60 * 24),
  );

  return remainingDays <= 0 ? "D-DAY" : `D-${remainingDays}`;
}

export function getDday(startsAt, endsAt) {
  // 기존 상세/목록 화면의 단일 종료일 호출은 기존 표시를 유지한다.
  if (endsAt === undefined) {
    return getLegacyDday(startsAt);
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (
    !startsAt ||
    !endsAt ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "";
  }

  const now = new Date();

  if (now >= endDate) {
    return "종료";
  }

  if (now < startDate) {
    const remainingDays = Math.round(
      (getSeoulDayValue(startDate) - getSeoulDayValue(now)) /
        (1000 * 60 * 60 * 24),
    );

    return remainingDays === 0 ? "오늘 시작" : `시작 D-${remainingDays}`;
  }

  const remainingDays = Math.round(
    (getSeoulDayValue(endDate) - getSeoulDayValue(now)) /
      (1000 * 60 * 60 * 24),
  );

  return remainingDays === 0 ? "오늘 마감" : `마감 D-${remainingDays}`;
}

// "2026-10-11T09:00:00+09:00" → "26.10.11"
export function formatSeoulDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "";
  }

  // seoulDateFormatter로 서울 기준 연/월/일 뽑기
  const parts = seoulDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year").value; // "2026"
  const month = parts.find((part) => part.type === "month").value; // "10"
  const day = parts.find((part) => part.type === "day").value; // "11"

  return `${year.slice(-2)}.${month}.${day}`;
}

// "2026-10-12T14:30:00+09:00" → "2026. 10. 12"  (이용내역 "사용 완료" 날짜용)
// 서버 시간은 UTC 로 올 수도 있어서 서울 기준 날짜로 바꿔서 표시
export function formatSeoulDateDot(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = seoulDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}. ${month}. ${day}`;
}
