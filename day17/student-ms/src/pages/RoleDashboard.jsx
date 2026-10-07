import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  User,
  BarChart3,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import UserLayout from "../components/user/UserLayout";

function RoleDashboard() {
  const { profile } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const role = profile?.role;

  const name = profile?.name || "User";

  const roleName = {
    student: "Student",
    teacher: "Teacher",
    hod: "Head of Department",
  };

  // ==========================================
  // STUDENT
  // ==========================================

  const studentStats = [
    {
      label: "Attendance",
      value: "87%",
      description: "Overall attendance",
      icon: ClipboardCheck,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Courses",
      value: "6",
      description: "Enrolled courses",
      icon: BookOpen,
      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Average Marks",
      value: "82%",
      description: "Current semester",
      icon: TrendingUp,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Assignments",
      value: "3",
      description: "Pending assignments",
      icon: FileText,
      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

  // ==========================================
  // TEACHER
  // ==========================================

  const teacherStats = [
    {
      label: "My Courses",
      value: "4",
      description: "Currently teaching",
      icon: BookOpen,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Students",
      value: "142",
      description: "Assigned students",
      icon: Users,
      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Attendance",
      value: "91%",
      description: "Average class attendance",
      icon: ClipboardCheck,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Pending Marks",
      value: "12",
      description: "Need evaluation",
      icon: FileText,
      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

  // ==========================================
  // HOD
  // ==========================================

  const hodStats = [
    {
      label: "Students",
      value: "842",
      description: "Department students",
      icon: GraduationCap,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Teachers",
      value: "38",
      description: "Department faculty",
      icon: Users,
      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Courses",
      value: "24",
      description: "Active courses",
      icon: BookOpen,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Attendance",
      value: "89%",
      description: "Department average",
      icon: ClipboardCheck,
      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

  const stats =
    role === "student"
      ? studentStats
      : role === "teacher"
        ? teacherStats
        : hodStats;

  // ==========================================
  // COURSES
  // ==========================================

  const courses = [
    {
      code: "CS301",
      name: "Data Structures",
      instructor: "Dr. Arun Kumar",
      progress: 78,
    },
    {
      code: "CS302",
      name: "Database Management",
      instructor: "Prof. Priya",
      progress: 64,
    },
    {
      code: "CS303",
      name: "Operating Systems",
      instructor: "Dr. Karthik",
      progress: 82,
    },
  ];

  // ==========================================
  // RECENT ACTIVITY
  // ==========================================

  const activities = [
    {
      title: "Attendance marked",
      description: "Data Structures",
      time: "10 minutes ago",
    },
    {
      title: "New assignment posted",
      description: "Database Management",
      time: "2 hours ago",
    },
    {
      title: "Marks updated",
      description: "Operating Systems",
      time: "Yesterday",
    },
    {
      title: "Announcement published",
      description: "Department notice",
      time: "Yesterday",
    },
  ];

  return (
    <UserLayout>
      {/* =====================================
          WELCOME
      ===================================== */}

      <div className="mb-6">
        <p className="text-sm text-blue-600 font-medium">{roleName[role]}</p>

        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back, {name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your academic activities.
        </p>
      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
                p-5
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`
                    w-10
                    h-10
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    ${stat.iconClass}
                  `}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Courses */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                {role === "student"
                  ? "My Courses"
                  : role === "teacher"
                    ? "My Courses"
                    : "Department Courses"}
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Current academic semester
              </p>
            </div>

            <button
              onClick={() => navigate(`/${role}/courses`)}
              className="
                text-xs
                font-medium
                text-blue-600
                hover:text-blue-700
                flex
                items-center
                gap-1
              "
            >
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div key={course.code} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="
                        text-xs
                        font-semibold
                        px-2
                        py-1
                        rounded
                        bg-blue-50
                        text-blue-600
                      "
                      >
                        {course.code}
                      </span>

                      <h3 className="text-sm font-semibold text-slate-800">
                        {course.name}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {course.instructor}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {course.progress}%
                  </span>
                </div>

                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${course.progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>

            <p className="text-xs text-slate-400 mt-1">Latest updates</p>
          </div>

          <div className="p-5 space-y-5">
            {activities.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className="
                  w-9
                  h-9
                  shrink-0
                  rounded-full
                  bg-blue-50
                  text-blue-600
                  flex
                  items-center
                  justify-center
                "
                >
                  <Clock size={16} />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {activity.title}
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {activity.description}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {role === "student" && (
            <>
              <QuickAction
                icon={BookOpen}
                title="Courses"
                onClick={() => navigate("/student/courses")}
              />

              <QuickAction
                icon={ClipboardCheck}
                title="Attendance"
                onClick={() => navigate("/student/attendance")}
              />

              <QuickAction
                icon={FileText}
                title="Marks"
                onClick={() => navigate("/student/marks")}
              />

              <QuickAction
                icon={User}
                title="My Profile"
                onClick={() => navigate("/student/profile")}
              />
            </>
          )}

          {role === "teacher" && (
            <>
              <QuickAction
                icon={Users}
                title="Students"
                onClick={() => navigate("/teacher/students")}
              />

              <QuickAction
                icon={ClipboardCheck}
                title="Attendance"
                onClick={() => navigate("/teacher/attendance")}
              />

              <QuickAction
                icon={FileText}
                title="Marks"
                onClick={() => navigate("/teacher/marks")}
              />

              <QuickAction
                icon={BookOpen}
                title="Courses"
                onClick={() => navigate("/teacher/courses")}
              />
            </>
          )}

          {role === "hod" && (
            <>
              <QuickAction
                icon={GraduationCap}
                title="Students"
                onClick={() => navigate("/hod/students")}
              />

              <QuickAction
                icon={Users}
                title="Teachers"
                onClick={() => navigate("/hod/teachers")}
              />

              <QuickAction
                icon={BookOpen}
                title="Courses"
                onClick={() => navigate("/hod/courses")}
              />

              <QuickAction
                icon={BarChart3}
                title="Reports"
                onClick={() => navigate("/hod/reports")}
              />
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

function QuickAction({ icon: Icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        p-4
        text-left
        hover:border-blue-300
        hover:shadow-sm
        transition
      "
    >
      <div
        className="
        w-9
        h-9
        rounded-lg
        bg-blue-50
        text-blue-600
        flex
        items-center
        justify-center
      "
      >
        <Icon size={18} />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-800">{title}</p>
    </button>
  );
}

export default RoleDashboard;
