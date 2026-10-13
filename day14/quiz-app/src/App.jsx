import { useContext } from "react";

import QuizContext from "./context/QuizContext";

import Question from "./components/Question";
import Result from "./components/Result";


const categories = [
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Entertainment: Books" },
  { id: 11, name: "Entertainment: Film" },
  { id: 12, name: "Entertainment: Music" },
  { id: 13, name: "Entertainment: Musicals & Theatres" },
  { id: 14, name: "Entertainment: Television" },
  { id: 15, name: "Entertainment: Video Games" },
  { id: 16, name: "Entertainment: Board Games" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 26, name: "Celebrities" },
  { id: 27, name: "Animals" },
  { id: 28, name: "Vehicles" },
  { id: 29, name: "Entertainment: Comics" },
  { id: 30, name: "Science: Gadgets" },
  { id: 31, name: "Entertainment: Japanese Anime & Manga" },
  { id: 32, name: "Entertainment: Cartoon & Animations" },
];
function App() {
  const {
    questions,
    quizFinished,
    loading,
    error,
    fetchQuestions,

    questionCount,
    setQuestionCount,

    difficulty,
    setDifficulty,

    category,
    setCategory,
  } = useContext(QuizContext);

  const handleStartQuiz = () => {
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      {/* START SCREEN */}
      {!questions.length && (
        <div className="w-full max-w-2xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl">
            {/* Heading */}
            <div className="text-center mb-8">
              <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-3">
                Quiz App
              </p>

              <h1 className="text-4xl font-bold text-white mb-3">
                Test Your Knowledge
              </h1>

              <p className="text-slate-400">
                Customize your quiz and see how well you score.
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Questions
                </label>

                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="
                                        w-full
                                        px-4
                                        py-3
                                        bg-slate-800
                                        border
                                        border-slate-700
                                        rounded-xl
                                        text-white
                                        outline-none
                                        focus:border-sky-400
                                        transition
                                    "
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="
                                        w-full
                                        px-4
                                        py-3
                                        bg-slate-800
                                        border
                                        border-slate-700
                                        rounded-xl
                                        text-white
                                        outline-none
                                        focus:border-sky-400
                                        transition
                                    "
                >
                  <option value="">Any Difficulty</option>

                  <option value="easy">Easy</option>

                  <option value="medium">Medium</option>

                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="
        w-full
        px-4
        py-3
        bg-slate-800
        border
        border-slate-700
        rounded-xl
        text-white
        outline-none
        focus:border-sky-400
        transition
    "
                >
                  <option value="">Any Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="
                                w-full
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
                                hover:scale-[1.02]
                                disabled:hover:scale-100
                            "
            >
              {loading ? "Loading Questions..." : "Start Quiz"}
            </button>

            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
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
