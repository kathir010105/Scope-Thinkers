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
    nextQuestion,
  } = useContext(QuizContext);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
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

        <h2 className="text-2xl font-semibold text-white leading-relaxed">
          {currentQuestion.question}
        </h2>

        <Options />

        <div className="flex justify-end mt-8">
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswer}
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
