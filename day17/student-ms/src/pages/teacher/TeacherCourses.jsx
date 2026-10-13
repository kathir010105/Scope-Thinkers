import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  BookOpen,
  Search,
  RefreshCw,
  Loader2,
  GraduationCap,
  Users,
  Clock3,
  Building2,
} from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebase";

import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";

function TeacherCourses() {
  const { profile } = useSelector((state) => state.auth);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const department = profile?.department || "Computer Science and Engineering";

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const coursesQuery = query(
        collection(db, "courses"),
        where("department", "==", department),
      );

      const snapshot = await getDocs(coursesQuery);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCourses(data);

      console.log("Teacher courses:", data);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setError("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [department]);

  const filteredCourses = courses.filter((course) => {
    const value = search.toLowerCase();

    return (
      String(course.name || "")
        .toLowerCase()
        .includes(value) ||
      String(course.code || "")
        .toLowerCase()
        .includes(value) ||
      String(course.courseCode || "")
        .toLowerCase()
        .includes(value)
    );
  });

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      <TeacherSidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TeacherHeader />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            {/* HEADER */}

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">
                  Teaching
                </p>

                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">
                  My Courses
                </h1>

                <p className="mt-2 text-sm text-[#8b7774]">
                  Courses available in your department.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchCourses}
                disabled={loading}
                className="flex w-fit items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* SEARCH */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]"
                />

                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-3">
                <BookOpen size={17} className="text-[#e06464]" />

                <span className="text-sm font-semibold text-[#48252a]">
                  {courses.length}
                </span>

                <span className="text-xs text-[#8b7774]">Courses</span>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-[#e06464]/20 bg-[#fbc6b9]/20 px-4 py-3 text-xs text-[#8b3e46]">
                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#eadfd8] bg-[#fffaf7]">
                <div className="text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-[#e06464]"
                  />

                  <p className="mt-3 text-sm text-[#8b7774]">
                    Loading courses...
                  </p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              /* EMPTY */

              <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#eadfd8] bg-[#fffaf7]">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbc6b9]/40 text-[#e06464]">
                    <BookOpen size={26} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#48252a]">
                    {search ? "No courses found" : "No courses available"}
                  </h3>

                  <p className="mt-1 text-xs text-[#8b7774]">
                    {search
                      ? "Try a different search term."
                      : "Courses will appear here once they are created."}
                  </p>
                </div>
              </div>
            ) : (
              /* COURSE GRID */

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-[0_8px_30px_rgba(72,37,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#fbc6b9] hover:shadow-[0_14px_35px_rgba(72,37,42,0.08)]"
                  >
                    {/* ICON */}

                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbc6b9]/50 text-[#e06464]">
                        <BookOpen size={20} />
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                        Active
                      </span>
                    </div>

                    {/* COURSE NAME */}

                    <h3 className="mt-5 text-base font-semibold text-[#48252a]">
                      {course.name || course.courseName || "Unnamed Course"}
                    </h3>

                    {/* COURSE CODE */}

                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#e06464]">
                      {course.code || course.courseCode || "No course code"}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-5 space-y-3 border-t border-[#eadfd8] pt-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[#b29d96]" />

                        <span className="text-xs text-[#8b7774]">
                          {course.department || department}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-[#b29d96]" />

                        <span className="text-xs text-[#8b7774]">
                          {course.year || course.semester || "Academic course"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#b29d96]" />

                        <span className="text-xs text-[#8b7774]">
                          {course.students ?? course.studentCount ?? 0} students
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={14} className="text-[#b29d96]" />

                        <span className="text-xs text-[#8b7774]">
                          {course.hours
                            ? `${course.hours} hours`
                            : "Schedule not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherCourses;
