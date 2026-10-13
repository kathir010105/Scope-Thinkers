import { useForm } from "react-hook-form";

import { useUIStore } from "../store/useUIStore";

import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { executeTrade } from "../services/tradeApi";

import { tradeSchema, type TradeFormData } from "../schemas/tradeSchema";

function Trade() {

  const selectedSymbol = useUIStore((state) => state.selectedSymbol);

  const setSelectedSymbol = useUIStore((state) => state.setSelectedSymbol);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: "AAPL",
      side: "buy",
      quantity: undefined,
      price: undefined,
    },
  });

  const side = watch("side");

  const tradeMutation = useMutation({
    mutationFn: executeTrade,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["holdings"],
      });

      reset({
        symbol: "AAPL",
        side: "buy",
        quantity: undefined,
        price: undefined,
      });
    },
  });

  function onSubmit(data: TradeFormData) {
    tradeMutation.mutate(data);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Trade</h1>

        <p className="mt-1 text-sm text-gray-500">Execute a paper trade.</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-5">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="mb-2 block text-sm font-medium">
              Symbol
            </label>

            <input
              id="symbol"
              type="text"
              {...register("symbol")}
              className={`w-full rounded-lg border px-3 py-2.5 uppercase outline-none transition focus:border-black ${
                errors.symbol ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="AAPL"
            />

            {errors.symbol && (
              <p className="mt-1 text-sm text-red-500">
                {errors.symbol.message}
              </p>
            )}
          </div>

          {/* Order Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">Order Type</label>

            <div className="grid grid-cols-2 gap-2">
              {/* Buy */}
              <label
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${
                  side === "buy"
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value="buy"
                  {...register("side")}
                  className="hidden"
                />
                Buy
              </label>

              {/* Sell */}
              <label
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${
                  side === "sell"
                    ? "bg-red-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value="sell"
                  {...register("side")}
                  className="hidden"
                />
                Sell
              </label>
            </div>

            {errors.side && (
              <p className="mt-1 text-sm text-red-500">{errors.side.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              className="mb-2 block text-sm font-medium"
            >
              Quantity
            </label>

            <input
              id="quantity"
              type="number"
              step="1"
              {...register("quantity", {
                valueAsNumber: true,
              })}
              className={`w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-black ${
                errors.quantity ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="10"
            />

            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium">
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              {...register("price", {
                valueAsNumber: true,
              })}
              className={`w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-black ${
                errors.price ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="256.32"
            />

            {errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-400">
              Enter the price per share.
            </p>
          </div>

          {/* API Error */}
          {tradeMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">
                {tradeMutation.error.message}
              </p>
            </div>
          )}

          {/* Success */}
          {tradeMutation.isSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm text-emerald-600">
                Trade executed successfully.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={tradeMutation.isPending}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tradeMutation.isPending
              ? "Executing..."
              : `Execute ${side === "buy" ? "Buy" : "Sell"}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Trade;
