export function StatusBadge({ status, className = "" }) {
  const configs = {
    approved: { label: "Approved", className: "bg-emerald-50 text-emerald-600" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
    inactive: { label: "Inactive", className: "bg-slate-100 text-slate-500" },
    active: { label: "Active", className: "bg-emerald-50 text-emerald-600" },
    archived: { label: "Archived", className: "bg-slate-100 text-slate-500" },
  };

  const config = configs[status] || { label: status, className: "bg-slate-100 text-slate-500" };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export function RoleBadge({ role, className = "" }) {
  const configs = {
    admin: { label: "Admin", className: "bg-[#48252a] text-white", icon: "👑" },
    hod: { label: "HOD", className: "bg-[#e06464] text-white", icon: "🏫" },
    teacher: { label: "Teacher", className: "bg-[#f1745e] text-white", icon: "👨‍🏫" },
    student: { label: "Student", className: "bg-[#e6a07f] text-white", icon: "🎓" },
  };

  const config = configs[role] || { label: role, className: "bg-slate-100 text-slate-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export function DepartmentBadge({ department, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#fbc6b9]/50 text-[#48252a] ${className}`}>
      {department}
    </span>
  );
}

export function Avatar({ name, size = "h-9 w-9", className = "", src }) {
  const initial = name?.charAt(0).toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full ${size} object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-[#fbc6b9] text-[#48252a] ${size} ${className}`}>
      <span className="text-xs font-bold">{initial}</span>
    </div>
  );
}

export function UserAvatar({ name, role, size = "h-9 w-9", className = "" }) {
  const roleColors = {
    admin: "bg-[#48252a]",
    hod: "bg-[#e06464]",
    teacher: "bg-[#f1745e]",
    student: "bg-[#e6a07f]",
  };

  const initial = name?.charAt(0).toUpperCase() || "?";

  return (
    <div className={`flex items-center justify-center rounded-full ${roleColors[role] || "bg-[#fbc6b9]"} text-white ${size} ${className}`}>
      <span className="text-xs font-bold">{initial}</span>
    </div>
  );
}