import { useContext } from "react";
import QuizContext from "../context/QuizContext";
import Options from "./Options";

function Question() {
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    score,
    answerSubmitted,
    timeLeft,
    nextQuestion,
    goHome,
  } = useContext(QuizContext);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goHome}
            className="
            text-sm
            text-slate-400
            hover:text-white
            transition-colors
            duration-200
        "
          >
            ← Home
          </button>
          <span className="text-sm font-semibold text-sky-400">
            Question {currentQuestionIndex + 1}
          </span>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {currentQuestionIndex + 1} / {questions.length}
            </span>

            <span className="text-sm font-semibold text-emerald-400">
              Score: {score}
            </span>
          </div>
        </div>
        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div
            className={`
            min-w-24
            px-5
            py-3
            rounded-xl
            border
            text-center
            transition-all
            duration-300
            ${
              timeLeft <= 5
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : timeLeft <= 10
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-sky-500/50 bg-sky-500/10 text-sky-400"
            }
        `}
          >
            <p className="text-xs uppercase tracking-widest opacity-70">Time</p>

            <p className="text-2xl font-bold mt-1">{timeLeft}s</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Question */}
        <h2 className="text-2xl font-semibold text-white leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <Options />

        {/* Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswer && !answerSubmitted}
            className="
                            px-6
                            py-3
                            bg-sky-500
                            hover:bg-sky-400
                            disabled:bg-slate-700
                            disabled:text-slate-500
                            text-slate-950
                            font-semibold
                            rounded-xl
                            transition-all
                            duration-200
                            disabled:cursor-not-allowed
                        "
          >
            {answerSubmitted ? "Next Question" : "Check Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Question;
