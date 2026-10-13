import { Search, Bell, UserCircle } from "lucide-react";

function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Search */}
      <div className="flex w-96 items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search stocks, ETFs, crypto..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />

          <span className="text-gray-600">Markets Open</span>
        </div>

        <button className="rounded-lg p-2 hover:bg-gray-100">
          <Bell size={20} />
        </button>

        <button className="rounded-lg p-2 hover:bg-gray-100">
          <UserCircle size={22} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
