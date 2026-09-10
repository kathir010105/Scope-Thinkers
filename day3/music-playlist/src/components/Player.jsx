import { useSelector, useDispatch } from "react-redux";
import { togglePlay } from "../redux/musicSlice";

function Player() {
  const currentSong = useSelector((state) => state.music.currentSong);

  const isPlaying = useSelector((state) => state.music.isPlaying);

  const dispatch = useDispatch();

  if (!currentSong) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 text-center">
        <p className="text-zinc-500">🎵 Select a song to start playing</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
        Now Playing
      </p>

      <div className="flex items-center">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{currentSong.title}</h2>

          <p className="text-zinc-400">{currentSong.artist}</p>
        </div>

        <button
          onClick={() => dispatch(togglePlay())}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
        >
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
      </div>
    </div>
  );
}

export default Player;
