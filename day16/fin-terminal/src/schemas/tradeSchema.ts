import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(10, "Symbol is too long"),

  side: z.enum(["buy", "sell"]),

  quantity: z
    .number({
      message: "Quantity is required",
    })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  price: z
    .number({
      message: "Price is required",
    })
    .positive("Price must be greater than 0"),
});

export type TradeFormData = z.infer<typeof tradeSchema>;
