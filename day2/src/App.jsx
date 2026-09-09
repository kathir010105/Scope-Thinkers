import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import AddTask from "./pages/AddTask";
import TaskDetails from "./pages/TaskDetails";
import { TaskProvider } from "./context/TaskContext";

function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">

  <Link
    to="/"
    className="text-2xl font-bold text-blue-600"
  >
    Home
  </Link>

  <Link
    to="/add"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg
               hover:bg-blue-700 transition"
  >
    + Add Task
  </Link>

</nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App;