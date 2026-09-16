import React from "react";
import { BrowserRouter } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPath: window.location.pathname,
    };
  }

  componentDidMount() {
    window.addEventListener("popstate", this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }

  handlePopState = () => {
    this.setState({
      currentPath: window.location.pathname,
    });
  };

  handleNavigation = (path) => {
    this.setState({
      currentPath: path,
    });
  };

  getPageInfo = () => {
    const { currentPath } = this.state;

    switch (currentPath) {
      case "/students":
        return {
          title: "Students",
          description: "Manage all students in your institution.",
        };

      case "/courses":
        return {
          title: "Courses",
          description: "Manage courses offered by the institution.",
        };

      case "/attendance":
        return {
          title: "Attendance",
          description: "Track and manage student attendance.",
        };

      case "/marks":
        return {
          title: "Marks",
          description: "Manage student marks and grades.",
        };

      case "/teachers":
        return {
          title: "Teachers",
          description: "Manage teachers and faculty members.",
        };

      case "/departments":
        return {
          title: "Departments",
          description: "Manage institution departments.",
        };

      case "/settings":
        return {
          title: "Settings",
          description: "Manage application settings.",
        };

      case "/dashboard":
      default:
        return {
          title: "Dashboard",
          description: "Welcome back, Admin.",
        };
    }
  };

  render() {
    const pageInfo = this.getPageInfo();

    return (
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100 flex">
          {/* Sidebar */}
          <Sidebar onNavigate={this.handleNavigation} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Navbar */}
            <Navbar title={pageInfo.title} description={pageInfo.description} />

            {/* Page */}
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
