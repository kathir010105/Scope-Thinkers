import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Users,
  UserCog,
  BookOpen,
  CalendarCheck,
  FileText,
  ArrowUpRight,
  Activity,
  Loader2,
  GraduationCap,
  Building2,
  Clock3,
} from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebase";

import HODSidebar from "../../components/hod/HODSidebar";
import HODHeader from "../../components/hod/HODHeader";

function HODDashboard() {
  const { profile } = useSelector((state) => state.auth);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    attendance: 87,
  });

  const department = profile?.department || "Computer Science and Engineering";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Only request users belonging to
       * the logged-in HOD's department.
       */
      const usersQuery = query(
        collection(db, "users"),
        where("department", "==", department),
      );

      const usersSnapshot = await getDocs(usersQuery);

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("HOD DEPARTMENT:", department);
      console.log("HOD DEPARTMENT USERS:", users);

      /*
       * Count approved students
       */
      const students = users.filter(
        (user) =>
          String(user.role ?? "")
            .trim()
            .toLowerCase() === "student" &&
          String(user.status ?? "")
            .trim()
            .toLowerCase() === "approved",
      ).length;

      /*
       * Count approved teachers
       */
      const teachers = users.filter(
        (user) =>
          String(user.role ?? "")
            .trim()
            .toLowerCase() === "teacher" &&
          String(user.status ?? "")
            .trim()
            .toLowerCase() === "approved",
      ).length;

      /*
       * Get courses belonging to this department.
       *
       * If the courses collection doesn't exist yet,
       * we simply show 0.
       */
      let courses = 0;

      try {
        const coursesQuery = query(
          collection(db, "courses"),
          where("department", "==", department),
        );

        const coursesSnapshot = await getDocs(coursesQuery);

        courses = coursesSnapshot.size;
      } catch (courseError) {
        console.warn("Courses could not be loaded:", courseError);

        courses = 0;
      }

      console.log("HOD STUDENTS:", students);
      console.log("HOD TEACHERS:", teachers);
      console.log("HOD COURSES:", courses);

      setStats({
        students,
        teachers,
        courses,
        attendance: 87,
      });
    } catch (error) {
      console.error("Failed to load HOD dashboard:", error);

      setError("Unable to load department dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.department) {
      fetchDashboardData();
    }
  }, [profile?.department]);

  const cards = [
    {
      title: "Students",
      value: stats.students,
      icon: Users,
      accent: "#e06464",
    },
    {
      title: "Teachers",
      value: stats.teachers,
      icon: UserCog,
      accent: "#f1745e",
    },
    {
      title: "Courses",
      value: stats.courses,
      icon: BookOpen,
      accent: "#e6a07f",
    },
    {
      title: "Attendance",
      value: `${stats.attendance}%`,
      icon: CalendarCheck,
      accent: "#48252a",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      {/* SIDEBAR */}

      <HODSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col">
        <HODHeader />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            {/* PAGE HEADER */}

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#48252a]">
                    HOD Dashboard
                  </h2>

                  <span className="rounded-full bg-[#fbc6b9] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#48252a]">
                    HOD
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#8b7774]">
                  Overview of your department and academic activities.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={loading}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm transition hover:border-[#fbc6b9] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Activity size={15} />
                )}

                {loading ? "Refreshing..." : "Refresh data"}
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-[#e06464]/20 bg-[#fbc6b9]/20 px-4 py-3 text-xs text-[#8b3e46]">
                {error}
              </div>
            )}

            {/* DEPARTMENT */}

            <section className="mb-5 overflow-hidden rounded-2xl bg-[#48252a] px-5 py-5 shadow-[0_8px_30px_rgba(72,37,42,0.08)] sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fbc6b9]">
                    Department
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {department}
                  </h3>

                  <p className="mt-1 text-xs text-[#e6d0ac]">
                    Department-level academic overview
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e06464] text-white">
                  <Building2 size={21} />
                </div>
              </div>
            </section>

            {/* STAT CARDS */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${card.accent}18`,
                          color: card.accent,
                        }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <ArrowUpRight size={15} className="text-[#e06464]" />
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

            {/* OVERVIEW */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
              <Panel
                title="Department Overview"
                subtitle="Current academic performance"
                icon={Activity}
                accent="#e06464"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ProgressItem label="Attendance" value={87} />

                  <ProgressItem label="Academic Performance" value={82} />

                  <ProgressItem label="Course Completion" value={91} />

                  <ProgressItem label="Student Engagement" value={76} />
                </div>
              </Panel>

              {/* ACTIVITY */}

              <Panel
                title="Recent Activity"
                subtitle="Latest department updates"
                icon={Clock3}
                accent="#f1745e"
              >
                <div className="space-y-4">
                  <ActivityRow
                    title="Attendance updated"
                    time="Today, 9:30 AM"
                  />

                  <ActivityRow
                    title="Marks submitted"
                    time="Yesterday, 4:20 PM"
                  />

                  <ActivityRow
                    title="New course added"
                    time="Yesterday, 11:15 AM"
                  />

                  <ActivityRow
                    title="Faculty activity updated"
                    time="2 days ago"
                  />
                </div>
              </Panel>
            </div>

            {/* QUICK ACTIONS */}

            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <QuickCard
                title="Manage Students"
                description="View and manage department students."
                icon={GraduationCap}
              />

              <QuickCard
                title="Attendance"
                description="Monitor department attendance."
                icon={CalendarCheck}
              />

              <QuickCard
                title="Reports"
                description="View academic department reports."
                icon={FileText}
              />
            </section>

            {/* MINI STATS */}

            <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniStat title="Students" value={stats.students} icon={Users} />

              <MiniStat
                title="Teachers"
                value={stats.teachers}
                icon={UserCog}
              />

              <MiniStat title="Courses" value={stats.courses} icon={BookOpen} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* PANEL */

function Panel({ title, subtitle, icon: Icon, accent, children }) {
  return (
    <section className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${accent}18`,
              color: accent,
            }}
          >
            <Icon size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#48252a]">{title}</p>

            <p className="text-[10px] text-[#b29d96]">{subtitle}</p>
          </div>
        </div>

        <ArrowUpRight size={17} className="text-[#b29d96]" />
      </div>

      {children}
    </section>
  );
}

/* PROGRESS */

function ProgressItem({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#8b7774]">{label}</span>

        <span className="text-[10px] font-semibold text-[#48252a]">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#fbc6b9]/40">
        <div
          className="h-full rounded-full bg-[#e06464] transition-all duration-500"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ACTIVITY */

function ActivityRow({ title, time }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#e06464]" />

      <div>
        <p className="text-xs font-semibold text-[#48252a]">{title}</p>

        <p className="mt-0.5 text-[10px] text-[#b29d96]">{time}</p>
      </div>
    </div>
  );
}

/* QUICK CARD */

function QuickCard({ title, description, icon: Icon }) {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-4 text-left shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#fbc6b9] hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc6b9]/50 text-[#e06464] transition group-hover:bg-[#e06464] group-hover:text-white">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-semibold text-[#48252a]">{title}</p>

      <p className="mt-1 text-[10px] leading-5 text-[#8b7774]">{description}</p>
    </button>
  );
}

/* MINI STAT */

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

export default HODDashboard;
