import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songs: [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      liked: false,
      previewUrl: "...",
    },
    {
      id: 2,
      title: "Shape of You",
      artist: "Ed Sheeran",
      liked: false,
      previewUrl: "...",
    },
    {
      id: 3,
      title: "Dracula",
      artist: "Tame Impala",
      liked: false,
      previewUrl: "...",
    },
  ],
  currentSong: null,
  isPlaying: false,
};


const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    toggleLike: (state, action) => {
      const song = state.songs.find((song) => song.id === action.payload);
      if (song) {
        song.liked = !song.liked;
      }
    },
    addSong: (state, action) => {
      state.songs.push(action.payload);
    },

    removeSong: (state, action) => {
      state.songs = state.songs.filter((song) => song.id !== action.payload);
    },
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    clearPlaylist: (state) => {
      state.songs = [];
      state.currentSong = null;
      state.isPlaying = false;
    },
    loadSongs: (state, action) => {
      state.songs = action.payload;
    },
  },
});

export const {
  toggleLike,
  addSong,
  removeSong,
  setCurrentSong,
  togglePlay,
  clearPlaylist,
  loadSongs,
} = musicSlice.actions;


export default musicSlice.reducer;
