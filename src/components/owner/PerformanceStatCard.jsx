export default function PerformanceStatCard({ label, value, icon, iconWidth = 24, iconHeight = 24 }) {
  return (
    <article className="flex h-[112px] flex-col justify-center gap-5 rounded-[20px] bg-[#f7f8f9] px-[15px] py-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
      <img src={icon} alt="" width={iconWidth} height={iconHeight} />
      <div className="leading-[1.4]">
        <p className="text-body2 font-medium tracking-[-0.014px] text-fg-muted">
          {label}
        </p>
        <p className="text-[20px] font-semibold leading-[140%] tracking-[-0.02px] text-fg">
          {value}
        </p>
      </div>
    </article>
  );
}
