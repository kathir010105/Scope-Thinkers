import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { marketAssets } from "../services/mockData";
import { useUIStore } from "../store/useUIStore";

function Markets() {
  const navigate = useNavigate();

  const setSelectedSymbol = useUIStore((state) => state.setSelectedSymbol);

  const handleTrade = (symbol: string) => {
    // Store the selected stock globally
    setSelectedSymbol(symbol);

    // Move to the Trade page
    navigate("/trade");
  };

  return (
    <div className="min-h-full bg-slate-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Markets</h1>

        <p className="mt-1 text-sm text-slate-500">
          Track market prices and start trading.
        </p>
      </div>

      {/* Market Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Market Status</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="font-semibold text-emerald-600">Markets Open</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Assets Tracked</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {marketAssets.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Asset Types</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {new Set(marketAssets.map((asset) => asset.type)).size}
          </p>
        </div>
      </div>

      {/* Market Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Market Assets</h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an asset to open the trading terminal.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Asset
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Change
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {marketAssets.map((asset) => {
                const isPositive = asset.change >= 0;

                return (
                  <tr
                    key={asset.symbol}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Asset */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                          {asset.symbol.slice(0, 2)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {asset.symbol}
                          </p>

                          <p className="text-sm text-slate-500">{asset.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {asset.type}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-slate-900">
                        ${asset.price.toFixed(2)}
                      </p>
                    </td>

                    {/* Change */}
                    <td className="px-6 py-4 text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-medium ${
                          isPositive ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}

                        <span>
                          {isPositive ? "+" : ""}
                          {asset.change.toFixed(2)}
                        </span>

                        <span>
                          ({isPositive ? "+" : ""}
                          {asset.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </td>

                    {/* Trade */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleTrade(asset.symbol)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {marketAssets.map((asset) => {
            const isPositive = asset.change >= 0;

            return (
              <div key={asset.symbol} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {asset.symbol.slice(0, 2)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {asset.symbol}
                      </p>

                      <p className="text-sm text-slate-500">{asset.name}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                    {asset.type}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      ${asset.price.toFixed(2)}
                    </p>

                    <div
                      className={`mt-1 flex items-center gap-1 text-sm font-medium ${
                        isPositive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight size={15} />
                      ) : (
                        <ArrowDownRight size={15} />
                      )}

                      <span>
                        {isPositive ? "+" : ""}
                        {asset.change.toFixed(2)}
                      </span>

                      <span>
                        ({isPositive ? "+" : ""}
                        {asset.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTrade(asset.symbol)}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Markets;
