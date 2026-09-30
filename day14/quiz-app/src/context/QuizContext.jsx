import { createContext, useState } from "react";

const QuizContext = createContext();

const decodeHTML = (text) => {
  const textarea = document.createElement("textarea");

  textarea.innerHTML = text;

  return textarea.value;
};

export function QuizProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const [quizFinished, setQuizFinished] = useState(false);

  // NEW
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://opentdb.com/api.php?category=28&amount=10&type=multiple",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();

      if (data.response_code !== 0) {
        throw new Error("Quiz API returned an error");
      }

      const formattedQuestions = data.results.map((question) => ({
        ...question,
        question: decodeHTML(question.question),
        correct_answer: decodeHTML(question.correct_answer),
        incorrect_answers: question.incorrect_answers.map(decodeHTML),
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizFinished(false);
      setAnswerSubmitted(false);
    } catch (error) {
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer) => {
    // Don't allow changing answer after submission
    if (answerSubmitted) {
      return;
    }

    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    // FIRST CLICK:
    // Show the answer
    if (!answerSubmitted) {
      if (selectedAnswer === currentQuestion.correct_answer) {
        setScore((previousScore) => previousScore + 1);
      }

      setAnswerSubmitted(true);
      return;
    }

    // SECOND CLICK:
    // Move to next question

    if (currentQuestionIndex === questions.length - 1) {
      setQuizFinished(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);

    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  const restartQuiz = () => {
    fetchQuestions();
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        selectedAnswer,
        score,
        quizFinished,
        answerSubmitted,
        loading,
        error,
        fetchQuestions,
        selectAnswer,
        nextQuestion,
        restartQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export default QuizContext;
