import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { tasks, deleteTask, updateTask } = useTasks();

  const task = tasks.find((task) => task.id === Number(id));

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  if (!task) {
    return <h2>Task not found</h2>;
  }

  function startEditing() {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);

    setIsEditing(true);
  }

  function handleUpdate(e) {
    e.preventDefault();

    updateTask(task.id, {
      title,
      description,
      priority,
    });

    setIsEditing(false);
  }

  function handleDelete() {
    deleteTask(task.id);
    navigate("/");
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
        >
          ✕
        </button>

        {!isEditing ? (
          <>
            {/* VIEW MODE */}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {task.title}
            </h1>

            <p className="text-gray-600 mb-6">{task.description}</p>

            <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Priority: {task.priority}
            </div>

            <div className="flex gap-3 mt-8" >
              <button
                onClick={startEditing}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            {/* EDIT MODE */}

            <h1 className="text-3xl font-bold mb-6">Edit Task</h1>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block font-medium mb-2">Task Name</label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Description</label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Priority</label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskDetails;
