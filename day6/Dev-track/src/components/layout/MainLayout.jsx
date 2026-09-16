import React from "react";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
