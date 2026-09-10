import { useDispatch } from "react-redux";
import { toggleLike, removeSong, setCurrentSong } from "../redux/musicSlice";

function SongCard({ song }) {
  const dispatch = useDispatch();

  return (
    <div className="bg-zinc-900 rounded-xl p-5 flex items-center gap-4 hover:bg-zinc-800 transition">
      {/* Song information */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold truncate">{song.title}</h3>

        <p className="text-zinc-400 text-sm mt-1">{song.artist}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch(setCurrentSong(song))}
          className="bg-white text-black px-3 py-2 rounded-lg hover:bg-zinc-200 transition"
        >
          ▶️
        </button>

        <button
          onClick={() => dispatch(toggleLike(song.id))}
          className="bg-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-700 transition"
        >
          {song.liked ? "❤️" : "🤍"}
        </button>

        <button
          onClick={() => dispatch(removeSong(song.id))}
          className="bg-zinc-800 px-3 py-2 rounded-lg hover:bg-red-600 transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default SongCard;
