import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function AddTask() {
  const navigate = useNavigate();
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  function handleSubmit(e) {
    e.preventDefault();

    const newTask = {
      title,
      description,
      priority,
    };

    addTask(newTask);

    navigate("/");
  }

  return (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">

      <h1 className="text-3xl font-bold mb-6">
        Add Task
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block font-medium mb-2">
            Task Name
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task name"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter task description"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex gap-3 pt-3">

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg
                       hover:bg-blue-700 transition"
          >
            Save Task
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg
                       hover:bg-gray-300 transition"
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  </div>
);
}

export default AddTask;