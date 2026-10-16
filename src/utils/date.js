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

export function getDday(endsAt) {
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
