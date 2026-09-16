import { configureStore } from "@reduxjs/toolkit";

import studentsReducer from "./slices/studentsSlice";

const store = configureStore({
  reducer: {
    students: studentsReducer,
  },
});

export default store;
