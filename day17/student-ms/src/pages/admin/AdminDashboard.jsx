import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  UserCog,
  ClipboardList,
  Building2,
  BookOpen,
  CalendarCheck,
  Bell,
  FileText,
  ArrowUpRight,
  Loader2,
  Activity,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

function AdminDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    pendingRequests: 0,
    departments: 0,
    courses: 0,
    attendance: 0,
    notifications: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const usersSnapshot = await getDocs(collection(db, "users"));

      const users = usersSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      console.log("ALL USERS FROM FIRESTORE:", users);

      // Normalize values before comparing
      const getRole = (user) =>
        String(user.role ?? "")
          .trim()
          .toLowerCase()
          .replace(/^["']|["']$/g, "");

      const getStatus = (user) =>
        String(user.status ?? "")
          .trim()
          .toLowerCase()
          .replace(/^["']|["']$/g, "");

      users.forEach((user) => {
        console.log(
          "USER:",
          user.email,
          "| ROLE:",
          JSON.stringify(user.role),
          "| NORMALIZED:",
          getRole(user),
        );
      });

      const students = users.filter(
        (user) => getRole(user) === "student",
      ).length;

      const teachers = users.filter(
        (user) => getRole(user) === "teacher",
      ).length;

      const pendingRequests = users.filter(
        (user) => getStatus(user) === "pending",
      ).length;

      let departments = 0;
      let courses = 0;

      try {
        departments = (await getDocs(collection(db, "departments"))).size;
      } catch {
        departments = 0;
      }

      try {
        courses = (await getDocs(collection(db, "courses"))).size;
      } catch {
        courses = 0;
      }

      console.log("FINAL COUNTS:");
      console.log("Total:", users.length);
      console.log("Students:", students);
      console.log("Teachers:", teachers);
      console.log("Pending:", pendingRequests);

      setStats({
        totalUsers: users.length,
        students,
        teachers,
        pendingRequests,
        departments,
        courses,
        attendance: 0,
        notifications: 0,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Total users", value: stats.totalUsers, icon: Users },
    { title: "Students", value: stats.students, icon: GraduationCap },
    { title: "Teachers", value: stats.teachers, icon: UserCog },
    { title: "Departments", value: stats.departments, icon: Building2 },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      <AdminSidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">
                  Overview
                </p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">
                  Dashboard
                </h2>
                <p className="mt-2 text-sm text-[#8b7774]">
                  A quick view of your institution.
                </p>
              </div>

              <button
                onClick={fetchDashboardData}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm transition hover:border-[#fbc6b9] hover:bg-white"
              >
                <Activity size={15} /> Refresh data
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-[#e06464]/20 bg-[#fbc6b9]/20 px-4 py-3 text-xs text-[#8b3e46]">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card, index) => {
                const Icon = card.icon;
                const accents = ["#e06464", "#f1745e", "#e6a07f", "#48252a"];
                const accent = accents[index];

                return (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${accent}18`,
                          color: accent,
                        }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-medium text-[#b29d96]">
                        Live
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-medium text-[#8b7774]">
                      {card.title}
                    </p>
                    <div className="mt-1 text-3xl font-semibold tracking-tight text-[#48252a]">
                      {loading ? (
                        <Loader2
                          size={26}
                          className="animate-spin text-[#e06464]"
                        />
                      ) : (
                        card.value
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat
                title="Pending requests"
                value={stats.pendingRequests}
                icon={ClipboardList}
              />
              <MiniStat title="Courses" value={stats.courses} icon={BookOpen} />
              <MiniStat
                title="Today's attendance"
                value={`${stats.attendance}%`}
                icon={CalendarCheck}
              />
              <MiniStat
                title="Notifications"
                value={stats.notifications}
                icon={Bell}
              />
            </section>

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Panel title="Recent activity" icon={Activity} accent="#e06464">
                <div className="space-y-3">
                  <ActivityRow
                    icon={Users}
                    title="User directory is ready"
                    description={`${stats.totalUsers} registered accounts`}
                  />
                  <ActivityRow
                    icon={GraduationCap}
                    title="Student accounts"
                    description={`${stats.students} approved student profile${stats.students === 1 ? "" : "s"}`}
                  />
                  <ActivityRow
                    icon={UserCog}
                    title="Teaching accounts"
                    description={`${stats.teachers} approved teacher profile${stats.teachers === 1 ? "" : "s"}`}
                  />
                </div>
              </Panel>

              <Panel
                title="Academic snapshot"
                icon={BookOpen}
                accent="#f1745e"
                action
              >
                <div className="grid grid-cols-2 gap-3">
                  <Snapshot
                    label="Courses"
                    value={stats.courses}
                    icon={BookOpen}
                  />
                  <Snapshot
                    label="Attendance"
                    value={`${stats.attendance}%`}
                    icon={CalendarCheck}
                  />
                  <Snapshot label="Exams" value="0" icon={FileText} />
                  <Snapshot
                    label="Notices"
                    value={stats.notifications}
                    icon={Bell}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MiniStat({ title, value, icon: Icon }) {
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

function Panel({ title, icon: Icon, accent, action, children }) {
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
            <p className="text-[10px] text-[#b29d96]">Updated overview</p>
          </div>
        </div>
        {action && <ArrowUpRight size={17} className="text-[#b29d96]" />}
      </div>
      {children}
    </section>
  );
}

function ActivityRow({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#eadfd8] bg-white/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f2ee] text-[#e06464]">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#48252a]">{title}</p>
        <p className="mt-0.5 truncate text-[10px] text-[#8b7774]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Snapshot({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#eadfd8] bg-white/70 p-4">
      <Icon size={16} className="text-[#e06464]" />
      <p className="mt-4 text-[10px] text-[#8b7774]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#48252a]">{value}</p>
    </div>
  );
}

export default AdminDashboard;
