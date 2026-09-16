import React from "react";
import { BookOpen, Plus, Search } from "lucide-react";

class Courses extends React.Component {
  render() {
    return (
      <main className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Courses</h1>

            <p className="text-slate-500 mt-1">
              Manage courses offered by the institution.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition">
            <Plus size={20} />
            Add Course
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search courses..."
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Course
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Code
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Department
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Credits
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <BookOpen size={18} />
                    </div>

                    <span className="font-medium text-slate-800">
                      Database Management
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">CS201</td>

                <td className="px-6 py-4 text-sm text-slate-600">CSE</td>

                <td className="px-6 py-4 text-sm text-slate-600">4</td>
              </tr>

              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <BookOpen size={18} />
                    </div>

                    <span className="font-medium text-slate-800">
                      Operating Systems
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">CS202</td>

                <td className="px-6 py-4 text-sm text-slate-600">CSE</td>

                <td className="px-6 py-4 text-sm text-slate-600">4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    );
  }
}

export default Courses;
