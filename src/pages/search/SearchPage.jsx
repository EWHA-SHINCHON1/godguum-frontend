import { useState } from "react";
import { useNavigate } from "react-router-dom";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import closeIcon from "../../assets/icons/close.svg";
import { SearchBar } from "../../components/common";

const INITIAL_RECENT_SEARCHES = [
  "올베르",
  "무시무시",
  "성무",
  "무시무시",
  "올베르",
  "무시무시",
  "성무",
];

function RecentSearchChip({ keyword, onRemove }) {
  return (
    <span className="inline-flex h-[29px] items-center gap-0.5 rounded-full bg-brand-weak px-3 py-1.5 text-body3 font-medium text-brand-contrast">
      {keyword}
      <button
        type="button"
        aria-label={`${keyword} 최근 검색어 삭제`}
        onClick={onRemove}
        className="-mr-1 inline-flex size-[14px] items-center justify-center"
      >
        <img src={closeIcon} alt="" width={14} height={14} />
      </button>
    </span>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);

  const removeRecentSearch = (index) => {
    setRecentSearches((searches) => searches.filter((_, searchIndex) => searchIndex !== index));
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[402px] bg-brand-surface">
      <header className="flex h-[60px] items-center justify-between px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center"
        >
          <img
            src={chevronLeft}
            alt=""
            width={7.5}
            height={15}
            className="shrink-0"
          />
        </button>
      </header>

      <div className="px-5">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => {}}
          autoFocus
        />
      </div>

      {recentSearches.length > 0 && (
        <section className="mt-5 px-5" aria-labelledby="recent-searches-heading">
          <div className="flex items-center justify-between">
            <h1 id="recent-searches-heading" className="text-body1 font-semibold leading-[1.5] text-fg">
              최근 검색어
            </h1>
            <button
              type="button"
              onClick={() => setRecentSearches([])}
              className="text-caption1 font-medium text-fg-muted"
            >
              전체 삭제
            </button>
          </div>
          <div className="mt-4 flex max-w-[321px] flex-wrap gap-2">
            {recentSearches.map((keyword, index) => (
              <RecentSearchChip
                key={`${keyword}-${index}`}
                keyword={keyword}
                onRemove={() => removeRecentSearch(index)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
