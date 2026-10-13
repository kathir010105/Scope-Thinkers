import { Bell, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";

function UserHeader() {
  const { profile } = useSelector((state) => state.auth);
  const name = profile?.name || "User";
  const role = profile?.role || "student";

  const roleLabel = {
    student: "Student",
    teacher: "Teacher",
    hod: "Head of Department",
  };

  return (
    <header className="sticky top-0 z-30 h-[78px] shrink-0 border-b border-[#eadfd8] bg-[#fffaf7]/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5 lg:px-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">
            Academic Portal
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-[#48252a] sm:text-xl">
            Government Polytechnic
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#8b7774] transition hover:bg-[#fbc6b9]/30 hover:text-[#48252a]">
            <Bell size={19} strokeWidth={1.8} />
            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#e06464]" />
          </button>

          <div className="mx-1 hidden h-8 w-px bg-[#eadfd8] sm:block" />

          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[#f8f2ee]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc6b9] text-[#48252a]">
              <span className="text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden text-left md:block">
              <p className="max-w-[150px] truncate text-xs font-semibold text-[#48252a]">
                {name}
              </p>
              <p className="text-[10px] text-[#8b7774]">
                {roleLabel[role] || role}
              </p>
            </div>
            <ChevronDown size={15} className="text-[#8b7774]" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default UserHeader;
