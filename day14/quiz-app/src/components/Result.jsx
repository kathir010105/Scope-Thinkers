import { useContext } from "react";
import QuizContext from "../context/QuizContext";

function Result() {
  const { score, questions, restartQuiz } = useContext(QuizContext);

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl text-center">
        <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-3">
          Quiz Complete
        </p>

        <h1 className="text-4xl font-bold text-white mb-8">Your Results</h1>

        <div className="mb-8">
          <p className="text-6xl font-bold text-sky-400">
            {score}
            <span className="text-3xl text-slate-500">/{questions.length}</span>
          </p>

          <p className="text-slate-400 mt-3">You scored {percentage}%</p>
        </div>

        <button
          onClick={restartQuiz}
          className="
                        px-6
                        py-3
                        bg-sky-500
                        hover:bg-sky-400
                        text-slate-950
                        font-semibold
                        rounded-xl
                        transition-all
                        duration-200
                        hover:scale-105
                    "
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

export default Result;
