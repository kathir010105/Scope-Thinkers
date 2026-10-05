import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const messageSlice = createSlice({
  name: "message",

  initialState,

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Insert message in correct timestamp order
    insertMessage: (state, action) => {
      const newMessage = action.payload;
      const newTime = newMessage.createdAt || 0;

      // Find the correct position to insert (keep ascending order: oldest first)
      const insertIndex = state.messages.findIndex(
        (msg) => (msg.createdAt || 0) > newTime
      );

      if (insertIndex === -1) {
        // New message is the latest, add to end
        state.messages.push(newMessage);
      } else {
        // Insert at the correct position
        state.messages.splice(insertIndex, 0, newMessage);
      }
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, insertMessage, clearMessages } = messageSlice.actions;

export default messageSlice.reducer;
