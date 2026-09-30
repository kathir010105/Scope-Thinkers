import { useContext } from "react";

import QuizContext from "./context/QuizContext";

import Question from "./components/Question";
import Result from "./components/Result";

function App() {
  const { questions, quizFinished, loading, error, fetchQuestions } =
    useContext(QuizContext);

  const handleStartQuiz = () => {
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* START SCREEN */}

      {!questions.length && (
        <div className="w-full max-w-2xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl text-center">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Welcome
            </p>

            <h1 className="text-4xl font-bold text-white mb-4">
              General Knowledge Quiz
            </h1>

            <p className="text-slate-400 text-lg">
              Test your knowledge and see how well you score.
            </p>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="
                                mt-8
                                px-6
                                py-3
                                bg-sky-500
                                hover:bg-sky-400
                                disabled:bg-slate-700
                                disabled:text-slate-400
                                text-slate-950
                                font-semibold
                                rounded-xl
                                transition-all
                                duration-200
                                hover:scale-105
                                disabled:hover:scale-100
                            "
            >
              {loading ? "Loading Questions..." : "Start Quiz"}
            </button>

            {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>
        </div>
      )}

      {/* QUIZ */}

      {questions.length > 0 && !quizFinished && <Question />}

      {/* RESULT */}

      {quizFinished && <Result />}
    </div>
  );
}

export default App;
