import { createContext, useEffect, useState } from "react";

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
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);

  const [quizFinished, setQuizFinished] = useState(false);

  // NEW
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      params.append("amount", questionCount);
      params.append("type", "multiple");

      if (difficulty) {
        params.append("difficulty", difficulty);
      }

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(
        `https://opentdb.com/api.php?${params.toString()}`,
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
      setTimeLeft(15);
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

    // First click → reveal answer
    if (!answerSubmitted) {
      if (selectedAnswer === currentQuestion.correct_answer) {
        setScore((previousScore) => previousScore + 1);
      }

      setAnswerSubmitted(true);
      return;
    }

    // Second click → move to next question
    if (currentQuestionIndex === questions.length - 1) {
      setQuizFinished(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);

    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setTimeLeft(15);
    };
    
    const goHome = () => {
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizFinished(false);
      setAnswerSubmitted(false);
      setTimeLeft(15);
      setError(null);
    };

  const restartQuiz = () => {
    fetchQuestions();
    };
    
    useEffect(() => {
      if (!questions.length || answerSubmitted || quizFinished) {
        return;
      }

      if (timeLeft === 0) {
        setAnswerSubmitted(true);
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft((previousTime) => previousTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }, [timeLeft, answerSubmitted, quizFinished, questions.length]);

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        selectedAnswer,
        score,
        quizFinished,
        answerSubmitted,
        timeLeft,
        loading,
        error,

        questionCount,
        setQuestionCount,

        difficulty,
        setDifficulty,

        category,
        setCategory,

        fetchQuestions,
        selectAnswer,
        nextQuestion,
        restartQuiz,
        goHome,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export default QuizContext;
