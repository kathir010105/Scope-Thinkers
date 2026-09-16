import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Hash,
  Building2,
  GraduationCap,
  CircleCheck,
} from "lucide-react";

class StudentDetails extends React.Component {
  getStudentId = () => {
    const parts = window.location.pathname.split("/");
    return parts[parts.length - 1];
  };

  render() {
    const { students } = this.props;

    const studentId = Number(this.getStudentId());

    const student = students.find((student) => student.id === studentId);

    if (!student) {
      return (
        <div className="p-6">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Students
          </Link>

          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              Student Not Found
            </h2>

            <p className="text-slate-500 mt-2">
              The student you are looking for does not exist.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Back Button */}
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={18} />
          Back to Students
        </Link>

        {/* Student Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={30} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {student.name}
              </h1>

              <p className="text-slate-500 mt-1">{student.rollNumber}</p>

              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-blue-600 font-medium">
                  {student.department}
                </span>

                <span className="text-slate-300">•</span>

                <span className="text-slate-500">{student.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-slate-400" />

              <div>
                <p className="text-sm text-slate-500">Email</p>

                <p className="font-medium text-slate-800">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash size={20} className="text-slate-400" />

              <div>
                <p className="text-sm text-slate-500">Roll Number</p>

                <p className="font-medium text-slate-800">
                  {student.rollNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            Academic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-slate-400" />

              <div>
                <p className="text-sm text-slate-500">Department</p>

                <p className="font-medium text-slate-800">
                  {student.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap size={20} className="text-slate-400" />

              <div>
                <p className="text-sm text-slate-500">Year</p>

                <p className="font-medium text-slate-800">{student.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CircleCheck size={20} className="text-slate-400" />

              <div>
                <p className="text-sm text-slate-500">Status</p>

                <p className="font-medium text-green-600">{student.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  students: state.students.students,
});

export default connect(mapStateToProps)(StudentDetails);
