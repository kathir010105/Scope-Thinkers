import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import Trade from "./pages/Trade";
import Watchlist from "./pages/Watchlist";
import Transactions from "./pages/Transactions";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/markets" element={<Markets />} />

              <Route path="/portfolio" element={<Portfolio />} />

              <Route path="/trade" element={<Trade />} />

              <Route path="/watchlist" element={<Watchlist />} />

              <Route path="/transactions" element={<Transactions />} />

              <Route path="/expenses" element={<Expenses />} />

              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
