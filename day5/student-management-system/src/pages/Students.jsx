import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { Users, Plus, Search, Pencil, Trash2, X } from "lucide-react";

import {
  fetchStudents,
  addStudent,
  deleteStudent,
  updateStudent,
} from "../redux/slices/studentsSlice";

class Students extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: "",
      isModalOpen: false,
      editingStudentId: null,

      formData: {
        name: "",
        email: "",
        rollNumber: "",
        department: "",
        year: "",
        status: "Active",
      },
    };
  }

  componentDidMount() {
    this.props.fetchStudents();
  }
  
  // Open modal for adding a student
  openModal = () => {
    this.setState({
      isModalOpen: true,
      editingStudentId: null,

      formData: {
        name: "",
        email: "",
        rollNumber: "",
        department: "",
        year: "",
        status: "Active",
      },
    });
  };

  // Open modal for editing a student
  openEditModal = (student) => {
    this.setState({
      isModalOpen: true,
      editingStudentId: student.id,

      formData: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        status: student.status,
      },
    });
  };

  // Close modal
  closeModal = () => {
    this.setState({
      isModalOpen: false,
      editingStudentId: null,
    });
  };

  // Handle search
  handleSearch = (event) => {
    this.setState({
      searchTerm: event.target.value,
    });
  };

  // Handle form input
  handleInputChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
    });
  };

  // Add / Update student
  handleSubmit = (event) => {
    event.preventDefault();

    const { editingStudentId, formData } = this.state;

    // Edit existing student
    if (editingStudentId) {
      this.props.updateStudent({
        id: editingStudentId,
        ...formData,
      });
    }

    // Add new student
    else {
      const newStudent = {
        id: Date.now(),
        ...formData,
      };

      this.props.addStudent(newStudent);
    }

    this.closeModal();
  };

  render() {
    const { students } = this.props;

    const { searchTerm, isModalOpen, editingStudentId, formData } = this.state;

    // Filter students
    const filteredStudents = students.filter((student) => {
      const search = searchTerm.toLowerCase();

      return (
        student.name.toLowerCase().includes(search) ||
        student.rollNumber.toLowerCase().includes(search) ||
        student.department.toLowerCase().includes(search)
      );
    });

    return (
      <div className="p-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">Students</h1>

                <p className="text-sm text-slate-500">
                  {students.length} students registered
                </p>
              </div>
            </div>
          </div>

          {/* Add Student Button */}
          <button
            onClick={this.openModal}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="relative max-w-md">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name, roll number or department..."
              value={searchTerm}
              onChange={this.handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Student
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Roll Number
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Department
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Year
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={18} className="text-blue-600" />
                          </div>

                          <div>
                            <p className="font-medium text-slate-800">
                              {student.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.rollNumber}
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {student.department}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.year}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* View */}
                          <Link
                            to={`/students/${student.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View
                          </Link>

                          {/* Edit */}
                          <button
                            onClick={() => this.openEditModal(student)}
                            className="text-slate-500 hover:text-blue-600 transition"
                            title="Edit student"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => this.props.deleteStudent(student.id)}
                            className="text-slate-500 hover:text-red-600 transition"
                            title="Delete student"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* No Students */
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Users
                        size={40}
                        className="mx-auto text-slate-300 mb-3"
                      />

                      <p className="text-slate-500 font-medium">
                        No students found
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        Try changing your search.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {editingStudentId ? "Edit Student" : "Add New Student"}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {editingStudentId
                      ? "Update the student's information below."
                      : "Enter the student's information below."}
                  </p>
                </div>

                <button
                  onClick={this.closeModal}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={this.handleSubmit}>
                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={this.handleInputChange}
                      required
                      placeholder="Enter student name"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={this.handleInputChange}
                      required
                      placeholder="Enter email"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Roll Number
                    </label>

                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={this.handleInputChange}
                      required
                      placeholder="Enter roll number"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>

                    <select
                      name="department"
                      value={formData.department}
                      onChange={this.handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select department</option>

                      <option value="CSE">CSE</option>

                      <option value="ECE">ECE</option>

                      <option value="EEE">EEE</option>

                      <option value="MECH">MECH</option>

                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Year
                    </label>

                    <select
                      name="year"
                      value={formData.year}
                      onChange={this.handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select year</option>

                      <option value="1st Year">1st Year</option>

                      <option value="2nd Year">2nd Year</option>

                      <option value="3rd Year">3rd Year</option>

                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Status
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={this.handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Active">Active</option>

                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={this.closeModal}
                    className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editingStudentId ? "Update Student" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  students: state.students.students,
});

const mapDispatchToProps = {
  fetchStudents,
  addStudent,
  deleteStudent,
  updateStudent,
};
export default connect(mapStateToProps, mapDispatchToProps)(Students);
