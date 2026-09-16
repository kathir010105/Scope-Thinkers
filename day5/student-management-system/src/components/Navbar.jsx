import React from "react";
import { Bell } from "lucide-react";

class Navbar extends React.Component {
  render() {
    const { title, description } = this.props;

    return (
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        {/* Page Information */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>

          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Notification */}
          <button className="relative text-slate-600 hover:text-slate-900 transition">
            <Bell size={21} />

            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Admin</p>

              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Navbar;
