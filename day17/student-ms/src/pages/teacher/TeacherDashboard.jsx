import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Users,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  ArrowUpRight,
  Activity,
  Loader2,
  GraduationCap,
  Clock3,
  FileText,
} from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebase";

import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";

function TeacherDashboard() {
  const { profile } = useSelector((state) => state.auth);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    attendance: 0,
    marks: 0,
  });

  const department = profile?.department || "Computer Science and Engineering";

  /*
   * Fetch teacher dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * -------------------------------------------------------
       * STUDENTS
       * -------------------------------------------------------
       *
       * Teachers are allowed to read the students collection.
       *
       * We only retrieve students belonging to this teacher's
       * department.
       */

      let students = 0;

      try {
        const studentsQuery = query(
          collection(db, "students"),
          where("department", "==", department),
        );

        const studentsSnapshot = await getDocs(studentsQuery);

        students = studentsSnapshot.size;
      } catch (studentError) {
        console.warn("Students could not be loaded:", studentError);

        students = 0;
      }

      /*
       * -------------------------------------------------------
       * COURSES
       * -------------------------------------------------------
       *
       * Teachers can read courses.
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

      /*
       * Attendance and marks will become real values
       * when those modules are implemented.
       */

      const attendance = 87;

      const marks = 82;

      console.log("TEACHER DEPARTMENT:", department);
      console.log("TEACHER STUDENTS:", students);
      console.log("TEACHER COURSES:", courses);

      setStats({
        students,
        courses,
        attendance,
        marks,
      });
    } catch (error) {
      console.error("Failed to load teacher dashboard:", error);

      setError("Unable to load teacher dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load dashboard when teacher profile is available
   */
  useEffect(() => {
    if (profile?.department) {
      fetchDashboardData();
    }
  }, [profile?.department]);

  /*
   * Dashboard cards
   */
  const cards = [
    {
      title: "My Students",
      value: stats.students,
      icon: Users,
      accent: "#e06464",
    },
    {
      title: "My Courses",
      value: stats.courses,
      icon: BookOpen,
      accent: "#f1745e",
    },
    {
      title: "Attendance",
      value: `${stats.attendance}%`,
      icon: CalendarCheck,
      accent: "#e6a07f",
    },
    {
      title: "Academic Performance",
      value: `${stats.marks}%`,
      icon: BarChart3,
      accent: "#48252a",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      {/* SIDEBAR */}

      <TeacherSidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      {/* MAIN AREA */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <TeacherHeader />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            {/* PAGE HEADER */}

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#48252a]">
                    Teacher Dashboard
                  </h2>

                  <span className="rounded-full bg-[#fbc6b9] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#48252a]">
                    Teacher
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#8b7774]">
                  Manage your classes, students and academic activities.
                </p>
              </div>

              {/* REFRESH */}

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

            {/* DEPARTMENT BANNER */}

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
                    Your teaching and academic workspace
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e06464] text-white">
                  <GraduationCap size={21} />
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
              {/* ACADEMIC OVERVIEW */}

              <Panel
                title="Academic Overview"
                subtitle="Current teaching performance"
                icon={BarChart3}
                accent="#e06464"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ProgressItem label="Attendance" value={87} />

                  <ProgressItem label="Academic Performance" value={82} />

                  <ProgressItem label="Course Completion" value={91} />

                  <ProgressItem label="Student Engagement" value={76} />
                </div>
              </Panel>

              {/* RECENT ACTIVITY */}

              <Panel
                title="Recent Activity"
                subtitle="Your latest updates"
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
                    title="Course activity updated"
                    time="Yesterday, 11:15 AM"
                  />

                  <ActivityRow
                    title="Student record viewed"
                    time="2 days ago"
                  />
                </div>
              </Panel>
            </div>

            {/* QUICK ACTIONS */}

            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <QuickCard
                title="My Students"
                description="View students assigned to your department."
                icon={Users}
              />

              <QuickCard
                title="Attendance"
                description="Record and monitor student attendance."
                icon={CalendarCheck}
              />

              <QuickCard
                title="Marks"
                description="Enter and manage student marks."
                icon={ClipboardList}
              />
            </section>

            {/* BOTTOM STATS */}

            <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniStat title="Students" value={stats.students} icon={Users} />

              <MiniStat title="Courses" value={stats.courses} icon={BookOpen} />

              <MiniStat
                title="Attendance"
                value={`${stats.attendance}%`}
                icon={CalendarCheck}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PANEL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| PROGRESS ITEM
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ACTIVITY ROW
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| QUICK CARD
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MINI STAT
|--------------------------------------------------------------------------
*/

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

export default TeacherDashboard;
