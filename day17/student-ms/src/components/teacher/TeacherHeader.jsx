import { Bell, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";

function TeacherHeader() {
  const { profile } = useSelector((state) => state.auth);

  const name = profile?.name || "Teacher";

  const department = profile?.department || "Computer Science and Engineering";

  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#eadfd8] bg-[#fffaf7] px-5 lg:px-7">
      {/* LEFT */}

      <div>
        <h1 className="text-sm font-semibold text-[#48252a]">
          Student Management System
        </h1>

        <p className="mt-0.5 text-[9px] text-[#8b7774]">Teacher Panel</p>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-4">
        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#8b7774] transition hover:bg-[#fbc6b9]/30 hover:text-[#48252a]"
        >
          <Bell size={17} />

          <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e06464]" />
        </button>

        {/* PROFILE */}

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc6b9] text-xs font-semibold text-[#48252a]">
            {initial}
          </div>

          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold text-[#48252a]">{name}</p>

            <p className="max-w-[180px] truncate text-[9px] text-[#8b7774]">
              {department}
            </p>
          </div>

          <ChevronDown size={14} className="text-[#b29d96]" />
        </div>
      </div>
    </header>
  );
}

export default TeacherHeader;
