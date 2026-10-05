import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  authLoading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },

    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setAuthLoading, clearUser } = authSlice.actions;

export default authSlice.reducer;
