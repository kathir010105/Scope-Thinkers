import TaskCard from "../components/TaskCard";
import { useTasks } from "../context/TaskContext";

function Home() {
  const { tasks ,toggleTask} = useTasks();

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 px-6 py-6">TaskFlow</h1>
      
      <div className="flex flex-wrap justify-center gap-4 mt-6 ">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          priority={task.priority}
          completed={task.completed}
          toggleTask={toggleTask}
        />
      ))}
      </div>
    </div>
  );
}

export default Home;