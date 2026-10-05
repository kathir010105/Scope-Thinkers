import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    clearActiveChat: (state) => {
      state.activeChat = null;
    },
  },
});

export const { setActiveChat, clearActiveChat } = chatSlice.actions;

export default chatSlice.reducer;
