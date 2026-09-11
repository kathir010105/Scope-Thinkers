import { useEffect, useState } from "react";

function SearchBar({ onAddSong }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const searchSongs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            search
          )}&entity=song&limit=5`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }

        const data = await response.json();

        setResults(data.results);
      } catch (error) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };

    searchSongs();
  }, [search]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="🔍 Search for a song..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
      />

      {search.trim() && (
        <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          {loading && (
            <p className="p-4 text-zinc-400">
              Searching...
            </p>
          )}

          {error && (
            <p className="p-4 text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="p-4 text-zinc-400">
              No songs found.
            </p>
          )}

          {!loading &&
            !error &&
            results.map((song) => (
              <div
                key={song.trackId}
                className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition"
              >
                <img
                  src={song.artworkUrl100}
                  alt={song.trackName}
                  className="w-12 h-12 rounded object-cover"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {song.trackName}
                  </h3>

                  <p className="text-xs text-zinc-400 truncate">
                    {song.artistName}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onAddSong(song);
                    setSearch("");
                    setResults([]);
                  }}
                  className="bg-white text-black px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-200"
                >
                  + Add
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;