import { useQuery } from "@tanstack/react-query";

import HoldingsTable from "../components/ui/HoldingsTable";
import { fetchHoldings } from "../services/portfolioApi";

function Portfolio() {
  const {
    data: holdings = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["holdings"],
    queryFn: fetchHoldings,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Portfolio</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and analyze your investment positions.
        </p>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <HoldingsTable holdings={holdings} />
    </div>
  );
}

export default Portfolio;
