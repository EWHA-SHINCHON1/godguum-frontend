import { formatPrice } from "../../mocks/stores";

/**
 * 대표메뉴 카드 (Figma: 대표메뉴)
 */
export default function StoreMenuCard({ menu }) {
  return (
    <article className="flex w-full items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3">
      <img
        src={menu.image}
        alt={menu.name}
        width={80}
        height={80}
        className="size-20 shrink-0 rounded-[7px] object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="text-body1 leading-[1.5] font-semibold text-fg">
          {menu.name}
        </h3>
        <p className="text-body3 font-medium text-fg-muted">
          {menu.description}
        </p>
        <p className="text-body3 font-semibold text-brand-strong">
          {formatPrice(menu.price)}
        </p>
      </div>
    </article>
  );
}
