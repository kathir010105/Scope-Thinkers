import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";

// Fetch students from Supabase
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
);

// Add student to Supabase
export const addStudent = createAsyncThunk(
  "students/addStudent",
  async (student) => {
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          name: student.name,
          email: student.email,
          roll_number: student.rollNumber,
          department: student.department,
          year: student.year,
          status: student.status,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
);

// Update student in Supabase
export const updateStudent = createAsyncThunk(
  "students/updateStudent",
  async (student) => {
    const { data, error } = await supabase
      .from("students")
      .update({
        name: student.name,
        email: student.email,
        roll_number: student.rollNumber,
        department: student.department,
        year: student.year,
        status: student.status,
      })
      .eq("id", student.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
);

// Delete student from Supabase
export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (studentId) => {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) {
      throw new Error(error.message);
    }

    return studentId;
  },
);

const initialState = {
  students: [],
  loading: false,
  error: null,
};

const studentsSlice = createSlice({
  name: "students",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    // FETCH
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;

        state.students = action.payload.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          rollNumber: student.roll_number,
          department: student.department,
          year: student.year,
          status: student.status,
        }));
      })

      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // ADD
    builder
      .addCase(addStudent.fulfilled, (state, action) => {
        const student = action.payload;

        state.students.push({
          id: student.id,
          name: student.name,
          email: student.email,
          rollNumber: student.roll_number,
          department: student.department,
          year: student.year,
          status: student.status,
        });
      })

      .addCase(addStudent.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // UPDATE
    builder
      .addCase(updateStudent.fulfilled, (state, action) => {
        const updatedStudent = action.payload;

        const index = state.students.findIndex(
          (student) => student.id === updatedStudent.id,
        );

        if (index !== -1) {
          state.students[index] = {
            id: updatedStudent.id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            rollNumber: updatedStudent.roll_number,
            department: updatedStudent.department,
            year: updatedStudent.year,
            status: updatedStudent.status,
          };
        }
      })

      .addCase(updateStudent.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // DELETE
    builder
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(
          (student) => student.id !== action.payload,
        );
      })

      .addCase(deleteStudent.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default studentsSlice.reducer;
