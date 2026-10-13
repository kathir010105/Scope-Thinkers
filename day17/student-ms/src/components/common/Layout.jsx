import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading...", size = 30 }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <Loader2 size={size} className="mx-auto animate-spin text-[#e06464]" />
        <p className="mt-3 text-sm text-[#8b7774]">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#eadfd8] bg-[#fffaf7]">
      <div className="text-center px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbc6b9]/40 text-[#e06464]">
          <Icon size={26} />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-[#48252a]">{title}</h3>
        <p className="mt-1 text-xs text-[#8b7774] max-w-xs">{description}</p>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="rounded-xl border border-[#e06464]/20 bg-[#fbc6b9]/20 px-4 py-3 text-xs text-[#8b3e46] flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 px-3 py-1.5 text-xs font-medium text-[#e06464] border border-[#e06464] rounded-lg hover:bg-[#fbc6b9]/30 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, accent, loading = false, trend }) {
  return (
    <div className="group rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <span className="text-[10px] font-medium text-[#b29d96]">Live</span>
      </div>
      <p className="mt-6 text-xs font-medium text-[#8b7774]">{title}</p>
      <div className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">
        {loading ? (
          <Loader2 size={26} className="animate-spin text-[#e06464]" />
        ) : (
          value
        )}
      </div>
      {trend && (
        <p className="mt-2 text-xs text-[#8b7774]">{trend}</p>
      )}
    </div>
  );
}

export function MiniStat({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#eadfd8] bg-white/70 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9]/30 text-[#e06464]">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[10px] text-[#8b7774]">{title}</p>
        <p className="text-sm font-semibold text-[#48252a]">{value}</p>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action, icon: Icon, accent = "#e06464" }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {Icon && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
            {title}
          </p>
        )}
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">{subtitle || title}</h2>
      </div>
      {action && (
        <div className="flex items-center gap-2">{action}</div>
      )}
    </div>
  );
}

export function Panel({ title, subtitle, icon: Icon, accent = "#e06464", children, action }) {
  return (
    <section className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            <Icon size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#48252a]">{title}</p>
            {subtitle && <p className="text-[10px] text-[#b29d96]">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] ${className}`}>
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-[#48252a]">{title}</h3>
      )}
      {children}
    </div>
  );
}

export function Section({ title, children, className = "" }) {
  return (
    <section className={className}>
      {title && <h3 className="mb-4 text-sm font-semibold text-[#48252a]">{title}</h3>}
      {children}
    </section>
  );
}