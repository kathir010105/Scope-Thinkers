import { useQuery } from "@tanstack/react-query";

import StatCard from "../components/ui/StatCard";
import HoldingsTable from "../components/ui/HoldingsTable";
import Watchlist from "../components/ui/Watchlist";
import PortfolioChart from "../components/ui/PortfolioChart";

import { marketAssets } from "../services/mockData";
import { portfolioHistory } from "../services/portfolioData";
import { fetchHoldings } from "../services/portfolioApi";

function Dashboard() {
  // 1. Fetch holdings from backend
  const {
    data: holdings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["holdings"],
    queryFn: fetchHoldings,
  });

  // 2. Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  // 3. Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">Failed to load portfolio</h2>

        <p className="mt-1 text-sm text-red-600">
          Please make sure the backend server is running.
        </p>
      </div>
    );
  }

  // 4. Normal UI
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your portfolio today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Portfolio Value"
          value="$18,420.80"
          change="+$324.20 today"
          positive
        />

        <StatCard
          title="Today's P/L"
          value="+$324.20"
          change="+1.79%"
          positive
        />

        <StatCard
          title="Total P/L"
          value="+$1,222.90"
          change="+9.82%"
          positive
        />

        <StatCard
          title="Available Cash"
          value="$7,842.30"
          change="Ready to invest"
          positive
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Portfolio Performance</h2>

              <p className="text-sm text-gray-500">Your portfolio over time</p>
            </div>

            <select className="rounded-lg border px-3 py-2 text-sm outline-none">
              <option>1D</option>
              <option>1W</option>
              <option>1M</option>
              <option>3M</option>
              <option>1Y</option>
            </select>
          </div>

          <PortfolioChart data={portfolioHistory} />
        </div>

        <Watchlist assets={marketAssets} />
      </div>

      <HoldingsTable holdings={holdings} />
    </div>
  );
}

export default Dashboard;
