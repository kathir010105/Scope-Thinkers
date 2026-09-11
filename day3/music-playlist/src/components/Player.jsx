import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { togglePlay } from "../redux/musicSlice";

function Player() {
  const dispatch = useDispatch();

  const currentSong = useSelector((state) => state.music.currentSong);

  const isPlaying = useSelector((state) => state.music.isPlaying);

  const audioRef = useRef(null);

  // When current song changes
  useEffect(() => {
    if (!currentSong || !currentSong.previewUrl) {
      return;
    }

    audioRef.current.src = currentSong.previewUrl;

    audioRef.current.play().catch((error) => {
      console.log("Audio could not play:", error);
    });
  }, [currentSong]);

  // When play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentSong?.previewUrl) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.log("Audio could not play:", error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  if (!currentSong) {
    return (
      <div className="bg-zinc-900 rounded-xl p-5 text-center text-zinc-500">
        No song selected
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-5">
      <audio ref={audioRef} />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{currentSong.title}</h3>

          <p className="text-sm text-zinc-400">{currentSong.artist}</p>
        </div>

        <button
          onClick={() => dispatch(togglePlay())}
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
      </div>
    </div>
  );
}

export default Player;
