import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import closeIcon from "../../assets/icons/close.svg";
import { SearchBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";
import { getPromotions } from "../../api/promotions";
import { formatSeoulDate, getPromotionStatusLabel } from "../../utils/date";

const RECENT_SEARCHES_STORAGE_KEY = "godguum-recent-searches";

function getStoredRecentSearches() {
  try {
    const storedSearches = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);

    if (!storedSearches) {
      return [];
    }

    const parsedSearches = JSON.parse(storedSearches);

    return Array.isArray(parsedSearches)
      ? parsedSearches.filter((search) => typeof search === "string")
      : [];
  } catch {
    return [];
  }
}

function RecentSearchChip({ keyword, onRemove, onSearch }) {
  return (
    <span className="inline-flex h-[29px] items-center gap-0.5 rounded-full bg-brand-weak px-3 py-1.5 text-body3 font-medium text-brand-contrast">
      <button type="button" onClick={onSearch} className="whitespace-nowrap">
        {keyword}
      </button>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const [searchState, setSearchState] = useState({
    query: "",
    count: 0,
    results: [],
    loading: false,
    error: null,
  });
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
    } catch {
      // localStorage를 사용할 수 없는 환경에서도 검색 화면은 정상 동작해야 한다.
    }
  }, [recentSearches]);

  useEffect(() => {
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    if (!urlQuery) {
      setSearchState({
        query: "",
        count: 0,
        results: [],
        loading: false,
        error: null,
      });
      return undefined;
    }

    let isCurrent = true;

    setSearchState({
      query: urlQuery,
      count: 0,
      results: [],
      loading: true,
      error: null,
    });

    getPromotions({ q: urlQuery })
      .then((data) => {
        if (!isCurrent || searchRequestIdRef.current !== requestId) return;

        setSearchState({
          query: urlQuery,
          count: data.count ?? 0,
          results: data.results ?? [],
          loading: false,
          error: null,
        });
        setRecentSearches((searches) => [
          urlQuery,
          ...searches.filter((keyword) => keyword !== urlQuery),
        ]);
      })
      .catch((error) => {
        if (!isCurrent || searchRequestIdRef.current !== requestId) return;

        setSearchState({
          query: urlQuery,
          count: 0,
          results: [],
          loading: false,
          error,
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [urlQuery]);

  const resultCards = useMemo(
    () =>
      searchState.results.map((promotion) => ({
        id: promotion.id,
        storeName: promotion.store?.name ?? "",
        title: promotion.title,
        image: promotion.image_url || undefined,
        period: `${formatSeoulDate(promotion.starts_at)} ~ ${formatSeoulDate(promotion.ends_at)}`,
        dDay: getPromotionStatusLabel(promotion.starts_at, promotion.ends_at),
        saved: promotion.is_saved ?? false,
      })),
    [searchState.results],
  );

  const runSearch = (rawQuery) => {
    const trimmedQuery = rawQuery.trim();
    const nextSearchParams = new URLSearchParams(searchParams);

    if (!trimmedQuery) {
      setQuery("");
      nextSearchParams.delete("q");
      setSearchParams(nextSearchParams);
      return;
    }

    setQuery(trimmedQuery);
    nextSearchParams.set("q", trimmedQuery);
    setSearchParams(nextSearchParams);
  };

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

      <div className={`px-5${urlQuery ? " mt-2" : ""}`}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={runSearch}
          autoFocus
        />
      </div>

      {!urlQuery && recentSearches.length > 0 && (
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
                onSearch={() => runSearch(keyword)}
              />
            ))}
          </div>
        </section>
      )}

      {urlQuery && (
        <section className="mt-4 px-5" aria-live="polite" aria-labelledby="search-results-heading">
          {searchState.loading ? (
            <p className="py-20 text-center text-body2 font-medium text-fg-muted">
              검색 결과를 불러오는 중이에요
            </p>
          ) : searchState.error ? (
            <p className="py-20 text-center text-body2 font-medium text-fg-muted">
              검색 결과를 불러오지 못했어요
            </p>
          ) : (
            <>
              <h1 id="search-results-heading" className="text-body1 font-semibold leading-[1.5] text-fg">
                ‘{urlQuery}’ 검색 결과 <span className="text-brand-strong">{searchState.count}개</span>
              </h1>

              {resultCards.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {resultCards.map((promotion) => (
                    <li key={promotion.id}>
                      <PromotionListCard
                        promotion={promotion}
                        onClick={() => navigate(`/promotions/${promotion.id}`)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-20 text-center text-body2 font-medium text-fg-muted">
                  ‘{urlQuery}’ 검색 결과가 없어요.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
