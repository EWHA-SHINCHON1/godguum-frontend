import { useState } from "react";
import {
  Button,
  Tag,
  Bookmark,
  SearchBar,
  Header,
  IconButton,
  TopBar,
  BottomNav,
  CouponIssueBar,
  SegmentedTabs,
  ConfirmModal,
} from "./components/common";
import headerBookmark from "./assets/icons/header-bookmark.svg";
import characterSad from "./assets/icons/character-sad.svg";

/*
공통 컴포넌트 미리보기 페이지
 */
function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-3 border-b border-line py-6">
      <h2 className="px-5 text-body3 font-semibold text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}

const FILTERS = ["전체", "진행 중", "곧 시작", "오늘 마감"];

export default function App() {
  const [filter, setFilter] = useState("전체");
  const [saved, setSaved] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("available");
  const [nav, setNav] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[402px] bg-surface pb-32">
      <TopBar />

      <Header title="매장 정보" onBack={() => {}} />
      <Header title="프로모션" onBack={() => {}} />
      <Header
        onBack={() => {}}
        right={<IconButton icon={headerBookmark} label="저장" />}
      />

      <div className="flex items-center gap-1 px-5">
        {FILTERS.map((f) => (
          <Tag key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Tag>
        ))}
      </div>
      <div className="flex items-center gap-4 px-5">
        <Bookmark saved={saved} onToggle={setSaved} />
      </div>

      <div className="flex flex-col items-start gap-3 px-5">
        <Button variant="secondary" className="w-[180px]">
          프로모션 둘러보기
        </Button>
        <Button fullWidth>적용하기</Button>
        <div className="flex w-full gap-2">
          <Button variant="outline" size="md" className="flex-1">
            취소
          </Button>
          <Button
            size="md"
            className="flex-1"
            onClick={() => setModalOpen(true)}
          >
            모달 열기
          </Button>
        </div>
      </div>

      <SegmentedTabs
        items={[
          { value: "available", label: "사용 가능 (n)" },
          { value: "used", label: "사용 완료 (n)" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <CouponIssueBar />

      <div className="px-5">
        <BottomNav active={nav} onChange={setNav} />
      </div>

      <ConfirmModal
        open={modalOpen}
        image={characterSad}
        title="로그아웃할까요?"
        description="로그아웃하면 현재 계정의 쿠폰 사용이 제한될 수 있어요."
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </main>
  );
}
