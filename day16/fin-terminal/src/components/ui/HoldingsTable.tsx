import type { Holding } from "../../types/finance";

interface HoldingsTableProps {
  holdings: Holding[];
}

function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Your Holdings</h2>

        <p className="text-sm text-gray-500">Current portfolio positions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3">Qty</th>
              <th className="px-5 py-3">Avg. Price</th>
              <th className="px-5 py-3">Current</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">P/L</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {holdings.map((holding) => {
              const positive = holding.profitLoss >= 0;

              return (
                <tr key={holding.symbol} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">{holding.symbol}</p>

                      <p className="text-xs text-gray-500">{holding.name}</p>
                    </div>
                  </td>

                  <td className="px-5 py-4">{holding.quantity}</td>

                  <td className="px-5 py-4">
                    ${holding.averagePrice.toFixed(2)}
                  </td>

                  <td className="px-5 py-4">
                    ${holding.currentPrice.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    ${holding.marketValue.toLocaleString()}
                  </td>

                  <td
                    className={`px-5 py-4 font-medium ${
                      positive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {positive ? "+" : ""}${holding.profitLoss.toFixed(2)}
                    <span className="ml-2 text-xs">
                      ({positive ? "+" : ""}
                      {holding.profitLossPercent}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HoldingsTable;
