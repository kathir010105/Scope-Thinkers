import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SongCard from "./components/SongCard";
import AddSong from "./components/AddSong";
import Player from "./components/Player";
import SearchBar from "./components/SearchBar";

import {
  loadSongs,
  clearPlaylist,
  addSong
} from "./redux/musicSlice";

function App() {
  const dispatch = useDispatch();

  const songs = useSelector((state) => state.music.songs);

  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load songs from localStorage
  useEffect(() => {
    const savedSongs = localStorage.getItem("songs");

    if (savedSongs) {
      dispatch(loadSongs(JSON.parse(savedSongs)));
    }

    setLoaded(true);
  }, [dispatch]);

  // Save songs to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("songs", JSON.stringify(songs));
    }
  }, [songs, loaded]);

  // Add song from iTunes API to Redux playlist
  const handleAddSong = (song) => {
    const newSong = {
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      liked: false,
      previewUrl: song.previewUrl
    };

    dispatch(addSong(newSong));
  };

  // Statistics
  const totalSongs = songs.length;

  const likedSongs = songs.filter(
    (song) => song.liked
  ).length;

  const artists = new Set(
    songs.map((song) => song.artist)
  ).size;

  // Only filter our saved playlist by liked status
  const displayedSongs = showLikedOnly
    ? songs.filter((song) => song.liked)
    : songs;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            🎵 My Music Playlist
          </h1>

          <p className="text-zinc-400">
            Manage your favorite songs
          </p>
        </header>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-zinc-900 rounded-xl p-5 text-center">
            <p className="text-2xl">🎵</p>
            <p className="text-zinc-400 mt-2">
              Total Songs
            </p>
            <p className="text-2xl font-bold mt-1">
              {totalSongs}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-5 text-center">
            <p className="text-2xl">❤️</p>
            <p className="text-zinc-400 mt-2">
              Liked Songs
            </p>
            <p className="text-2xl font-bold mt-1">
              {likedSongs}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-5 text-center">
            <p className="text-2xl">🎤</p>
            <p className="text-zinc-400 mt-2">
              Artists
            </p>
            <p className="text-2xl font-bold mt-1">
              {artists}
            </p>
          </div>

        </div>

        {/* API Search + Filter */}
        <div className="flex gap-3 mb-6">

          <div className="flex-1">
            <SearchBar
              onAddSong={handleAddSong}
            />
          </div>

          <button
            onClick={() => setShowLikedOnly(false)}
            className={`px-4 rounded-lg ${
              !showLikedOnly
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setShowLikedOnly(true)}
            className={`px-4 rounded-lg ${
              showLikedOnly
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            ❤️ Liked
          </button>

        </div>

        {/* Manual Add Song */}
        <div className="mb-8">
          <AddSong />
        </div>

        {/* Playlist */}
        <div className="space-y-3">

          {displayedSongs.length > 0 ? (
            displayedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
              />
            ))
          ) : (
            <div className="text-center py-10 text-zinc-500">
              {showLikedOnly
                ? "No liked songs yet."
                : "Your playlist is empty."}
            </div>
          )}

        </div>

        {/* Clear Playlist */}
        <button
          onClick={() => dispatch(clearPlaylist())}
          className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          🗑️ Clear Playlist
        </button>

        {/* Player */}
        <div className="mt-10">
          <Player />
        </div>

      </div>
    </div>
  );
}

export default App;