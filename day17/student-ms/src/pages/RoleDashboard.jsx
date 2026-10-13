import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  Bell,
  CalendarDays,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserLayout from "../components/user/UserLayout";

function RoleDashboard() {
  const { profile } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const role = profile?.role;
  const name = profile?.name || "User";

  const data =
    {
      student: {
        label: "Student workspace",
        subtitle: "Your academic progress at a glance.",
        stats: [
          ["Attendance", "87%", ClipboardCheck],
          ["Courses", "6", BookOpen],
          ["Average marks", "82%", TrendingUp],
          ["Assignments", "3", FileText],
        ],
      },
      teacher: {
        label: "Teaching workspace",
        subtitle: "Everything you need for your classes.",
        stats: [
          ["Students", "142", Users],
          ["Courses", "4", BookOpen],
          ["Attendance", "91%", ClipboardCheck],
          ["Pending marks", "12", FileText],
        ],
      },
      hod: {
        label: "Department workspace",
        subtitle: "Monitor your department from one place.",
        stats: [
          ["Students", "842", GraduationCap],
          ["Teachers", "38", Users],
          ["Courses", "24", BookOpen],
          ["Attendance", "89%", ClipboardCheck],
        ],
      },
    }[role] || {};

  const quickActions = [
    ["Courses", BookOpen, `/${role}/courses`],
    ["Attendance", ClipboardCheck, `/${role}/attendance`],
    ["Marks", FileText, `/${role}/marks`],
    ["Profile", UserRound, `/${role}/profile`],
  ];

  return (
    <UserLayout>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">
            {data.label}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">
            Good morning, {name.split(" ")[0]}.
          </h2>
          <p className="mt-2 text-sm text-[#8b7774]">{data.subtitle}</p>
        </div>
        <div className="rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs text-[#8b7774]">
          <span className="font-semibold text-[#48252a]">Today</span> · Academic
          overview
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc6b9]/35 text-[#e06464]">
              <Icon size={19} />
            </div>
            <p className="mt-6 text-xs font-medium text-[#8b7774]">{title}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">
              {value}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title={role === "hod" ? "Department courses" : "My courses"}
          icon={BookOpen}
        >
          <div className="space-y-3">
            <Course code="CS301" name="Data Structures" progress={78} />
            <Course code="CS302" name="Database Management" progress={64} />
            <Course code="CS303" name="Operating Systems" progress={82} />
          </div>
        </Panel>

        <Panel title="Recent notifications" icon={Bell}>
          <div className="space-y-2">
            <Notification
              title="New assignment posted"
              description="Database Management · 2 hours ago"
            />
            <Notification
              title="Attendance updated"
              description="Data Structures · Today"
            />
            <Notification
              title="New department notice"
              description="Academic Department · Yesterday"
            />
          </div>
        </Panel>

        <Panel title="Attendance overview" icon={ClipboardCheck}>
          <div className="space-y-5">
            <AttendanceRow name="Data Structures" percentage={92} />
            <AttendanceRow name="Database Management" percentage={84} />
            <AttendanceRow name="Operating Systems" percentage={88} />
          </div>
        </Panel>

        <Panel title="Upcoming schedule" icon={CalendarDays}>
          <div className="space-y-2">
            <Schedule time="09:00" subject="Data Structures" room="Room 204" />
            <Schedule time="11:00" subject="Database Management" room="Lab 2" />
            <Schedule
              time="14:00"
              subject="Operating Systems"
              room="Room 301"
            />
          </div>
        </Panel>
      </div>

      <section className="mt-6 rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#48252a]">Quick access</p>
            <p className="mt-1 text-[10px] text-[#8b7774]">
              Jump to your most-used modules.
            </p>
          </div>
          <ArrowUpRight size={17} className="text-[#b29d96]" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map(([title, Icon, path]) => (
            <button
              key={title}
              onClick={() => navigate(path)}
              className="group flex items-center gap-3 rounded-xl border border-[#eadfd8] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[#fbc6b9] hover:shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbc6b9]/25 text-[#e06464]">
                <Icon size={17} />
              </div>
              <span className="text-xs font-semibold text-[#48252a]">
                {title}
              </span>
            </button>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9]/30 text-[#e06464]">
          <Icon size={17} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#48252a]">{title}</p>
          <p className="text-[10px] text-[#b29d96]">Updated overview</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Course({ code, name, progress }) {
  return (
    <div className="rounded-xl border border-[#eadfd8] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#e06464]">
            {code}
          </span>
          <p className="mt-1 truncate text-xs font-semibold text-[#48252a]">
            {name}
          </p>
        </div>
        <span className="text-xs font-semibold text-[#8b7774]">
          {progress}%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1e8e4]">
        <div
          className="h-full rounded-full bg-[#e06464]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Notification({ title, description }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#eadfd8] bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbc6b9]/25 text-[#e06464]">
        <Bell size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-[#48252a]">{title}</p>
        <p className="mt-1 text-[10px] text-[#8b7774]">{description}</p>
      </div>
    </div>
  );
}

function AttendanceRow({ name, percentage }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <span className="text-xs text-[#8b7774]">{name}</span>
        <span className="text-xs font-semibold text-[#48252a]">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#f1e8e4]">
        <div
          className="h-full rounded-full bg-[#f1745e]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Schedule({ time, subject, room }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#eadfd8] bg-white p-3">
      <div className="w-12 shrink-0 text-xs font-bold text-[#e06464]">
        {time}
      </div>
      <div className="h-8 w-px bg-[#eadfd8]" />
      <div>
        <p className="text-xs font-semibold text-[#48252a]">{subject}</p>
        <p className="mt-1 text-[10px] text-[#8b7774]">{room}</p>
      </div>
    </div>
  );
}

export default RoleDashboard;
