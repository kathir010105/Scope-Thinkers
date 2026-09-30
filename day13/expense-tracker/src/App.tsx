
import { useState } from "react";

type Category = "Food" | "Travel" | "Shopping";

type Expense = {
  id: number;
  name: string;
  amount: number;
  category: Category;
};

function App() {
  // -----------------------------
  // Expenses
  // -----------------------------

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      name: "Food",
      amount: 500,
      category: "Food",
    },
    {
      id: 2,
      name: "Bus",
      amount: 200,
      category: "Travel",
    },
    {
      id: 3,
      name: "Shoes",
      amount: 800,
      category: "Shopping",
    },
  ]);

  // -----------------------------
  // Form State
  // -----------------------------

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");

  // -----------------------------
  // Add Expense
  // -----------------------------

  function addExpense(): void {
    if (!name || !amount) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      name: name,
      amount: Number(amount),
      category: category,
    };

    setExpenses((currentExpenses) => [
      ...currentExpenses,
      newExpense,
    ]);

    // Reset form
    setName("");
    setAmount("");
    setCategory("Food");
  }

  // -----------------------------
  // Delete Expense
  // -----------------------------

  function deleteExpense(id: number): void {
    setExpenses((currentExpenses) => {
      return currentExpenses.filter(
        (expense) => expense.id !== id
      );
    });
  }

  // -----------------------------
  // Calculate Total
  // -----------------------------

  function calculateTotal(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => {
      return total + expense.amount;
    }, 0);
  }

  const total = calculateTotal(expenses);

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Calculator
          </h1>

          <p className="mt-2 text-gray-500">
            Keep track of your daily expenses.
          </p>
        </div>

        {/* Total */}

        <div className="mb-6 rounded-2xl bg-black p-6 text-white shadow-sm">
          <p className="text-sm text-gray-400">
            Total Spent
          </p>

          <p className="mt-2 text-3xl font-bold">
            ₹{total}
          </p>
        </div>

        {/* Add Expense Form */}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Add Expense
          </h2>

          <div className="space-y-4">

            {/* Expense Name */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Expense Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Food"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-black"
              />
            </div>

            {/* Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-black"
              />
            </div>

            {/* Category */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Category)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-black"
              >
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
              </select>
            </div>

            {/* Add Button */}

            <button
              onClick={addExpense}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Add Expense
            </button>

          </div>
        </div>

        {/* Expense List */}

        <div className="space-y-3">

          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >

              {/* Expense Information */}

              <div>
                <h2 className="font-semibold text-gray-900">
                  {expense.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {expense.category}
                </p>
              </div>

              {/* Amount + Delete */}

              <div className="flex items-center gap-4">

                <p className="text-lg font-bold text-gray-900">
                  ₹{expense.amount}
                </p>

                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default App;
