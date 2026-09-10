import { useState } from "react";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;

    setSearch(value);
    onSearch(value);
  };

  return (
    <input
      type="text"
      placeholder="🔍 Search songs or artists..."
      value={search}
      onChange={handleChange}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
    />
  );
}

export default SearchBar;
