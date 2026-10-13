import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Users,
  Loader2,
  GraduationCap,
  Mail,
  Building2,
  RefreshCw,
} from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";

function TeacherStudents() {
  const { profile } = useSelector((state) => state.auth);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const department = profile?.department || "Computer Science and Engineering";

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const studentsQuery = query(
        collection(db, "students"),
        where("department", "==", department),
      );

      const snapshot = await getDocs(studentsQuery);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStudents(data);

      console.log("Teacher students:", data);
    } catch (error) {
      console.error("Failed to load students:", error);
      setError("Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department]);

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      String(student.name || "")
        .toLowerCase()
        .includes(value) ||
      String(student.email || "")
        .toLowerCase()
        .includes(value) ||
      String(student.rollNo || "")
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
                  Academic
                </p>

                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">
                  My Students
                </h1>

                <p className="mt-2 text-sm text-[#8b7774]">
                  Students belonging to your department.
                </p>
              </div>

              <button
                onClick={fetchStudents}
                disabled={loading}
                className="flex w-fit items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9]"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* SEARCH + COUNT */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]"
                />

                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-3">
                <Users size={17} className="text-[#e06464]" />

                <span className="text-sm font-semibold text-[#48252a]">
                  {students.length}
                </span>

                <span className="text-xs text-[#8b7774]">Students</span>
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
                    Loading students...
                  </p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              /* EMPTY */

              <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#eadfd8] bg-[#fffaf7]">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbc6b9]/40 text-[#e06464]">
                    <GraduationCap size={26} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#48252a]">
                    {search ? "No students found" : "No student records yet"}
                  </h3>

                  <p className="mt-1 text-xs text-[#8b7774]">
                    {search
                      ? "Try a different search term."
                      : "Student academic records will appear here."}
                  </p>
                </div>
              </div>
            ) : (
              /* STUDENT TABLE */

              <div className="overflow-hidden rounded-2xl border border-[#eadfd8] bg-[#fffaf7] shadow-[0_8px_30px_rgba(72,37,42,0.04)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[#eadfd8] bg-[#f8f2ee]">
                        <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">
                          Student
                        </th>

                        <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">
                          Roll No
                        </th>

                        <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">
                          Email
                        </th>

                        <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">
                          Department
                        </th>

                        <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-[#eadfd8] last:border-0 hover:bg-[#f8f2ee]/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9] text-[#48252a]">
                                <GraduationCap size={17} />
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-[#48252a]">
                                  {student.name || "Unnamed Student"}
                                </p>

                                <p className="text-[10px] text-[#b29d96]">
                                  Student
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-[#48252a]">
                            {student.rollNo || student.rollNumber || "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-xs text-[#8b7774]">
                              <Mail size={14} />

                              {student.email || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-xs text-[#8b7774]">
                              <Building2 size={14} />

                              {student.department || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherStudents;
