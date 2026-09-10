import { useState } from "react";
import { useDispatch } from "react-redux";
import { addSong } from "../redux/musicSlice";

function AddSong() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !artist.trim()) {
      return;
    }

    const newSong = {
      id: Date.now(),
      title: title.trim(),
      artist: artist.trim(),
      liked: false,
    };

    dispatch(addSong(newSong));

    setTitle("");
    setArtist("");
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Add a Song</h2>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
        />

        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
        />

        <button
          type="submit"
          className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-zinc-200 transition"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default AddSong;
