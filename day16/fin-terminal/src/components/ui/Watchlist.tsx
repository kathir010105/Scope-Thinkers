import { ArrowDown, ArrowUp } from "lucide-react";

import type { Asset } from "../../types/finance";

interface WatchlistProps {
  assets: Asset[];
}

function Watchlist({ assets }: WatchlistProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Watchlist</h2>

        <p className="text-sm text-gray-500">Market movements</p>
      </div>

      <div className="divide-y">
        {assets.map((asset) => {
          const positive = asset.change >= 0;

          return (
            <div
              key={asset.symbol}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{asset.symbol}</p>

                <p className="text-xs text-gray-500">{asset.name}</p>
              </div>

              <div className="text-right">
                <p className="font-medium">${asset.price.toLocaleString()}</p>

                <div
                  className={`flex items-center justify-end gap-1 text-xs ${
                    positive ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {asset.changePercent}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Watchlist;
