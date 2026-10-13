import { Bell, ChevronDown } from "lucide-react";

import { useSelector } from "react-redux";

function HODHeader() {
  const { profile } = useSelector((state) => state.auth);

  const name = profile?.name || "HOD";
  const department = profile?.department || "Department";

  return (
    <header className="h-[90px] shrink-0 border-b border-[#E6D0AC]/40 bg-white">
      <div className="flex h-full items-center justify-between px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#48252A]">
            Student Management System
          </h1>

          <p className="mt-1 text-xs text-[#E06464]">
            Head of Department Panel
          </p>
        </div>

        <div className="flex items-center">
          <button className="relative flex h-10 w-10 items-center justify-center text-[#48252A]/60">
            <Bell size={21} />

            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-[#E06464]" />
          </button>

          <div className="mx-4 h-8 w-px bg-[#E6D0AC]" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBC6B9] text-[#48252A]">
              <span className="font-semibold">{name.charAt(0)}</span>
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[#48252A]">{name}</p>

              <p className="text-[11px] text-slate-400">{department}</p>
            </div>

            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default HODHeader;
