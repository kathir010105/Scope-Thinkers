import { useNavigate } from "react-router-dom";

function TaskCard(props) {
  const navigate = useNavigate();

  function handleDone(e) {
    e.stopPropagation();
    props.toggleTask(props.id);
  }

  return (
    <div
      onClick={() => navigate(`/tasks/${props.id}`)}
      className={`bg-white p-5 rounded-xl shadow-md mb-4 cursor-pointer hover:shadow-lg transition flex items-center justify-between w-full${
        props.completed ? "opacity-60 w-full" : ""
      }`}
    >
      <div>
        <h2
          className={`text-xl font-semibold ${
            props.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {props.title}
        </h2>

        <p className="text-gray-600 mt-2">{props.description}</p>

        <p className="text-sm font-medium text-blue-600 mt-3">
          Priority: {props.priority}
        </p>
      </div>

      <button
        onClick={handleDone}
        className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          props.completed
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-600 hover:bg-green-100"
        }`}
      >
        {props.completed ? "✓" : "○"}
      </button>
    </div>
  );
}

export default TaskCard;
