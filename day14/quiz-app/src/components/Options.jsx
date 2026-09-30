import { useContext, useMemo } from "react";
import QuizContext from "../context/QuizContext";

function Options() {
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    selectAnswer,
    answerSubmitted,
  } = useContext(QuizContext);

  const currentQuestion = questions[currentQuestionIndex];

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }

    const options = [
      currentQuestion.correct_answer,
      ...currentQuestion.incorrect_answers,
    ];

    return [...options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="mt-8 space-y-3">
      {shuffledOptions.map((option, index) => {
        const isSelected = selectedAnswer === option;

        const isCorrect = option === currentQuestion.correct_answer;

        let optionStyle =
          "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800";

        // After clicking Next
        if (answerSubmitted) {
          // Correct answer → GREEN
          if (isCorrect) {
            optionStyle =
              "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
          }

          // Selected wrong answer → RED
          else if (isSelected) {
            optionStyle = "border-red-500/50 bg-red-500/10 text-red-300";
          }
        }

        // Before submitting
        else if (isSelected) {
          optionStyle = "border-sky-400 bg-sky-500/10 text-sky-300";
        }

        return (
          <button
            key={index}
            onClick={() => selectAnswer(option)}
            disabled={answerSubmitted}
            className={`
                            w-full
                            text-left
                            p-4
                            rounded-xl
                            border
                            transition-all
                            duration-200
                            ${optionStyle}
                            ${
                              answerSubmitted
                                ? "cursor-default"
                                : "cursor-pointer"
                            }
                        `}
          >
            <span className="font-medium">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Options;
