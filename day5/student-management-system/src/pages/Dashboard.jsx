import React from "react";
import { Users, UserRound, BookOpen, TrendingUp } from "lucide-react";

class Dashboard extends React.Component {
  render() {
    return (
      <main className="p-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Overview</h1>

          <p className="text-slate-500 mt-1">
            Here's what's happening in your institution today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6">
          {/* Total Students */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Students</p>

                <h2 className="text-3xl font-bold text-slate-800 mt-2">
                  1,248
                </h2>
              </div>

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Teachers</p>

                <h2 className="text-3xl font-bold text-slate-800 mt-2">84</h2>
              </div>

              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <UserRound size={24} />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Courses</p>

                <h2 className="text-3xl font-bold text-slate-800 mt-2">42</h2>
              </div>

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          {/* Average Attendance */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg. Attendance</p>

                <h2 className="text-3xl font-bold text-slate-800 mt-2">87%</h2>
              </div>

              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          {/* Attendance Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-80">
            <h2 className="text-lg font-bold text-slate-800">
              Attendance Overview
            </h2>

            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400">Chart will be added later</p>
            </div>
          </div>

          {/* Recent Students */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-80">
            <h2 className="text-lg font-bold text-slate-800">
              Recent Students
            </h2>

            <div className="mt-6 space-y-4">
              {/* Student 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Rahul Kumar</p>

                  <p className="text-xs text-slate-400">CSE • 2nd Year</p>
                </div>

                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Student 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Priya Sharma</p>

                  <p className="text-xs text-slate-400">ECE • 3rd Year</p>
                </div>

                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Student 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Arjun Reddy</p>

                  <p className="text-xs text-slate-400">EEE • 1st Year</p>
                </div>

                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default Dashboard;
