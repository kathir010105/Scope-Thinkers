import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Code2,
  ExternalLink,
  GraduationCap,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

const ACCENT = "#A34054";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const ACTIVITIES = [
  {
    value: "learn",
    label: "Learn",
    description: "Understand concepts step by step",
    icon: BookOpen,
  },
  {
    value: "quiz",
    label: "Quiz",
    description: "Test what you understand",
    icon: Brain,
  },
  {
    value: "practice",
    label: "Practice",
    description: "Solve coding exercises",
    icon: Code2,
  },
];

function Markdown({ children, theme }) {
  return (
    <div
      className="learning-markdown min-w-0 break-words text-sm leading-7"
      style={{ color: theme.text }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-5 text-lg font-semibold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
              style={{ color: ACCENT }}
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => (
            <code
              className={`rounded-md px-1.5 py-0.5 text-[0.9em] ${
                className || ""
              }`}
              style={{
                background: theme.surfaceAlt,
                color: theme.text,
              }}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              className="mb-4 max-w-full overflow-x-auto rounded-xl border p-4 text-xs leading-6"
              style={{
                background: theme.input,
                borderColor: theme.border,
              }}
            >
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="mb-4 border-l-2 pl-4"
              style={{
                borderColor: ACCENT,
                color: theme.muted,
              }}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mb-4 max-w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className="border p-2 font-semibold"
              style={{ borderColor: theme.border }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border p-2" style={{ borderColor: theme.border }}>
              {children}
            </td>
          ),
        }}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}

export default function LearningMode({ API_URL, theme, isDark }) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [mode, setMode] = useState("learn");
  const [count, setCount] = useState(5);

  const [content, setContent] = useState(null);
  const [sources, setSources] = useState([]);
  const [resultTopic, setResultTopic] = useState("");
  const [resultLevel, setResultLevel] = useState("");
  const [resultMode, setResultMode] = useState("learn");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unsupportedMessage, setUnsupportedMessage] = useState("");

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const [revealedHints, setRevealedHints] = useState({});
  const [revealedSolutions, setRevealedSolutions] = useState({});

  const cardStyle = {
    background: theme.surface,
    borderColor: theme.border,
  };

  const secondaryStyle = {
    background: theme.surfaceAlt,
    borderColor: theme.border,
  };

  async function generateLearningContent(event) {
    event.preventDefault();

    const cleanedTopic = topic.trim();

    if (!cleanedTopic || loading) return;

    setLoading(true);
    setError("");
    setUnsupportedMessage("");
    setContent(null);
    setSources([]);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setRevealedHints({});
    setRevealedSolutions({});

    try {
      const response = await fetch(`${API_URL}/api/learn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: cleanedTopic,
          mode,
          level,
          count,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || `Learning request failed (${response.status}).`,
        );
      }

      if (data.supported === false || !data.content) {
        setUnsupportedMessage(
          data.message ||
            "The indexed documentation doesn't contain enough information for this activity.",
        );
        return;
      }

      setContent(data.content);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setResultTopic(cleanedTopic);
      setResultLevel(level);
      setResultMode(mode);
    } catch (err) {
      setError(
        err.message ||
          "Unable to generate learning content. Check your backend connection.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetActivity() {
    setContent(null);
    setSources([]);
    setError("");
    setUnsupportedMessage("");
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setRevealedHints({});
    setRevealedSolutions({});
  }

  const questions = content?.questions || [];

  const quizScore = questions.reduce(
    (score, question, index) =>
      score + (selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0),
    0,
  );

  const panelStyle = {
    background: isDark ? "rgba(163,64,84,0.12)" : "rgba(163,64,84,0.06)",
    borderColor: "rgba(163,64,84,0.22)",
  };

  return (
    <section className="space-y-7">
      <div
        className="overflow-hidden rounded-2xl border p-5 sm:p-7"
        style={{
          ...cardStyle,
          boxShadow: isDark
            ? "0 18px 50px rgba(0,0,0,0.12)"
            : "0 18px 50px rgba(68,23,78,0.05)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "rgba(237,150,89,0.15)",
              color: "#ED9659",
            }}
          >
            <GraduationCap size={23} />
          </div>

          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: ACCENT }}
            >
              Learning Mode
            </p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">
              Learn by doing.
            </h2>
            <p
              className="mt-2 max-w-2xl text-sm leading-6"
              style={{ color: theme.muted }}
            >
              Turn your indexed technical documentation into lessons, quizzes,
              and coding exercises. Answers are grounded in your knowledge base.
            </p>
          </div>
        </div>

        <form onSubmit={generateLearningContent} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="learning-topic"
              className="mb-2 block text-sm font-semibold"
            >
              What do you want to learn?
            </label>

            <input
              id="learning-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={300}
              placeholder="e.g. Express middleware, React hooks, Java exception handling"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#A34054]"
              style={{
                background: theme.input,
                color: theme.text,
                borderColor: theme.border,
              }}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Choose an activity</p>

            <div className="grid gap-3 md:grid-cols-3">
              {ACTIVITIES.map((activity) => {
                const Icon = activity.icon;
                const active = mode === activity.value;

                return (
                  <button
                    key={activity.value}
                    type="button"
                    onClick={() => {
                      setMode(activity.value);
                      resetActivity();
                    }}
                    className="rounded-xl border p-4 text-left transition hover:-translate-y-0.5"
                    style={{
                      background: active
                        ? "rgba(163,64,84,0.10)"
                        : theme.surface,
                      borderColor: active ? ACCENT : theme.border,
                    }}
                  >
                    <div
                      className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        background: active
                          ? "rgba(163,64,84,0.14)"
                          : theme.surfaceAlt,
                        color: ACCENT,
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <p className="text-sm font-semibold">{activity.label}</p>
                    <p
                      className="mt-1 text-xs leading-5"
                      style={{ color: theme.muted }}
                    >
                      {activity.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="learning-level"
                className="mb-2 block text-sm font-semibold"
              >
                Your level
              </label>

              <select
                id="learning-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
                style={{
                  background: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                {LEVELS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {mode !== "learn" && (
              <div>
                <label
                  htmlFor="learning-count"
                  className="mb-2 block text-sm font-semibold"
                >
                  {mode === "quiz"
                    ? "Number of questions"
                    : "Number of exercises"}
                </label>

                <select
                  id="learning-count"
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                  className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
                  style={{
                    background: theme.input,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  {[3, 5, 7, 10].map((value) => (
                    <option key={value} value={value}>
                      {value} {mode === "quiz" ? "questions" : "exercises"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={{
              background: `linear-gradient(110deg, ${ACCENT}, #6B2249)`,
            }}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Preparing your activity...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Generate {mode === "learn" ? "lesson" : mode}
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border p-4 text-sm"
          style={panelStyle}
        >
          <div className="flex items-start gap-2">
            <XCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Could not generate content</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        </div>
      )}

      {unsupportedMessage && (
        <div
          role="status"
          className="rounded-xl border p-5"
          style={{ ...secondaryStyle, color: theme.text }}
        >
          <div className="flex items-start gap-3">
            <CircleHelp
              size={21}
              className="mt-0.5 shrink-0"
              style={{ color: "#ED9659" }}
            />
            <div>
              <p className="font-semibold">More documentation is needed</p>
              <p
                className="mt-1 text-sm leading-6"
                style={{ color: theme.muted }}
              >
                {unsupportedMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {content && (
        <div className="space-y-5">
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            style={panelStyle}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className="rounded-full px-2.5 py-1 font-semibold"
                  style={{
                    background: theme.surface,
                    color: ACCENT,
                  }}
                >
                  {resultMode.toUpperCase()}
                </span>

                <span style={{ color: theme.muted }}>
                  {resultLevel.charAt(0).toUpperCase() + resultLevel.slice(1)}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">{resultTopic}</p>
            </div>

            <button
              type="button"
              onClick={resetActivity}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{
                background: theme.surface,
                borderColor: theme.border,
              }}
            >
              <RotateCcw size={14} />
              Reset activity
            </button>
          </div>

          {resultMode === "learn" && (
            <article
              className="rounded-2xl border p-5 sm:p-7"
              style={cardStyle}
            >
              <h2 className="text-xl font-bold">
                {content.title || resultTopic}
              </h2>

              <div className="mt-4">
                <Markdown theme={theme}>{content.overview}</Markdown>
              </div>

              {(content.sections || []).map((section, index) => (
                <section
                  key={`${section.heading}-${index}`}
                  className="mt-7 border-t pt-5"
                  style={{ borderColor: theme.border }}
                >
                  <h3 className="mb-3 text-base font-bold">
                    {index + 1}. {section.heading}
                  </h3>
                  <Markdown theme={theme}>{section.content}</Markdown>
                </section>
              ))}

              {Array.isArray(content.keyTakeaways) &&
                content.keyTakeaways.length > 0 && (
                  <div
                    className="mt-7 rounded-xl border p-4"
                    style={panelStyle}
                  >
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                      <Target size={17} style={{ color: ACCENT }} />
                      Key takeaways
                    </h3>

                    <ul className="space-y-2">
                      {content.keyTakeaways.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm leading-6"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-1 shrink-0"
                            style={{ color: "#65C99A" }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </article>
          )}

          {resultMode === "quiz" && (
            <section className="space-y-4">
              <div className="rounded-xl border p-5" style={cardStyle}>
                <h2 className="text-lg font-bold">
                  {content.title || "Knowledge check"}
                </h2>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  {content.instructions ||
                    "Select one answer for each question."}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full"
                    style={{ background: theme.surfaceAlt }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${
                          (Object.keys(selectedAnswers).length /
                            Math.max(questions.length, 1)) *
                          100
                        }%`,
                        background: ACCENT,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.muted }}
                  >
                    {Object.keys(selectedAnswers).length}/{questions.length}
                  </span>
                </div>
              </div>

              {questions.map((question, index) => {
                const selected = selectedAnswers[index];
                const correct = question.correctAnswerIndex;

                return (
                  <article
                    key={`${question.question}-${index}`}
                    className="rounded-xl border p-5 sm:p-6"
                    style={cardStyle}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: ACCENT }}
                    >
                      Question {index + 1}
                    </p>

                    <h3 className="mt-2 text-base font-semibold leading-6">
                      {question.question}
                    </h3>

                    <div className="mt-4 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selected === optionIndex;
                        const isCorrect = correct === optionIndex;

                        let background = theme.surface;
                        let borderColor = theme.border;

                        if (submittedQuiz && isCorrect) {
                          background = "rgba(101,201,154,0.10)";
                          borderColor = "#65C99A";
                        } else if (submittedQuiz && isSelected && !isCorrect) {
                          background = "rgba(163,64,84,0.10)";
                          borderColor = ACCENT;
                        } else if (isSelected) {
                          background = "rgba(163,64,84,0.09)";
                          borderColor = ACCENT;
                        }

                        return (
                          <button
                            key={`${option}-${optionIndex}`}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() =>
                              setSelectedAnswers((previous) => ({
                                ...previous,
                                [index]: optionIndex,
                              }))
                            }
                            className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 transition disabled:cursor-default"
                            style={{
                              background,
                              borderColor,
                            }}
                          >
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                              style={{
                                borderColor,
                                color:
                                  submittedQuiz && isCorrect
                                    ? "#65C99A"
                                    : theme.text,
                              }}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>

                            <span className="flex-1">{option}</span>

                            {submittedQuiz && isCorrect && (
                              <CheckCircle2
                                size={17}
                                className="mt-1 shrink-0"
                                color="#65C99A"
                              />
                            )}

                            {submittedQuiz && isSelected && !isCorrect && (
                              <XCircle
                                size={17}
                                className="mt-1 shrink-0"
                                color={ACCENT}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && question.explanation && (
                      <div
                        className="mt-4 rounded-lg border p-3"
                        style={secondaryStyle}
                      >
                        <p className="mb-1 text-xs font-bold">Explanation</p>
                        <p
                          className="text-sm leading-6"
                          style={{ color: theme.muted }}
                        >
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}

              {!submittedQuiz ? (
                <button
                  type="button"
                  disabled={
                    Object.keys(selectedAnswers).length !== questions.length
                  }
                  onClick={() => setSubmittedQuiz(true)}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: ACCENT }}
                >
                  Check my answers
                </button>
              ) : (
                <div
                  className="rounded-2xl border p-6 text-center"
                  style={panelStyle}
                >
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(101,201,154,0.14)",
                      color: "#65C99A",
                    }}
                  >
                    <Target size={24} />
                  </div>

                  <p className="mt-3 text-sm font-semibold">Quiz completed</p>

                  <p className="mt-1 text-3xl font-bold">
                    {quizScore}/{questions.length}
                  </p>

                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {Math.round(
                      (quizScore / Math.max(questions.length, 1)) * 100,
                    )}
                    % correct
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setSubmittedQuiz(false);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
                    style={{
                      background: theme.surface,
                      borderColor: theme.border,
                    }}
                  >
                    <RotateCcw size={15} />
                    Try again
                  </button>
                </div>
              )}
            </section>
          )}

          {resultMode === "practice" && (
            <section className="space-y-4">
              <div className="rounded-xl border p-5" style={cardStyle}>
                <h2 className="text-lg font-bold">
                  {content.title || "Coding practice"}
                </h2>
                <p
                  className="mt-1 text-sm leading-6"
                  style={{ color: theme.muted }}
                >
                  Try solving each task before revealing its hints or solution.
                </p>
              </div>

              {(content.exercises || []).map((exercise, index) => (
                <article
                  key={`${exercise.title}-${index}`}
                  className="rounded-xl border p-5 sm:p-6"
                  style={cardStyle}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: ACCENT }}
                    >
                      Exercise {index + 1}
                    </p>

                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={panelStyle}
                    >
                      {exercise.difficulty || resultLevel}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold">{exercise.title}</h3>

                  <div className="mt-3">
                    <Markdown theme={theme}>{exercise.task}</Markdown>
                  </div>

                  {Array.isArray(exercise.hints) &&
                    exercise.hints.length > 0 && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedHints((previous) => ({
                              ...previous,
                              [index]: !previous[index],
                            }))
                          }
                          className="flex items-center gap-2 text-sm font-semibold"
                          style={{ color: ACCENT }}
                        >
                          {revealedHints[index] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          {revealedHints[index] ? "Hide hints" : "Show hints"}
                        </button>

                        {revealedHints[index] && (
                          <ul
                            className="mt-3 space-y-2 rounded-lg border p-4"
                            style={secondaryStyle}
                          >
                            {exercise.hints.map((hint, hintIndex) => (
                              <li key={hintIndex} className="text-sm leading-6">
                                <span className="font-semibold">
                                  Hint {hintIndex + 1}:{" "}
                                </span>
                                {hint}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                  <div
                    className="mt-5 border-t pt-4"
                    style={{ borderColor: theme.border }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedSolutions((previous) => ({
                          ...previous,
                          [index]: !previous[index],
                        }))
                      }
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
                      style={{
                        background: theme.surfaceAlt,
                        borderColor: theme.border,
                      }}
                    >
                      <Code2 size={16} />
                      {revealedSolutions[index]
                        ? "Hide solution"
                        : "Reveal solution"}
                    </button>

                    {revealedSolutions[index] && (
                      <div className="mt-4">
                        <Markdown theme={theme}>{exercise.solution}</Markdown>

                        {exercise.explanation && (
                          <div
                            className="mt-4 rounded-lg border p-4"
                            style={secondaryStyle}
                          >
                            <p className="mb-2 text-sm font-bold">
                              Why it works
                            </p>
                            <Markdown theme={theme}>
                              {exercise.explanation}
                            </Markdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}

          {sources.length > 0 && (
            <section className="rounded-xl border p-5" style={cardStyle}>
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <BookOpen size={17} style={{ color: ACCENT }} />
                Learning sources
              </h3>

              <div className="mt-3 space-y-2">
                {sources.map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-3 transition hover:opacity-80"
                    style={{
                      background: theme.surfaceAlt,
                      borderColor: theme.border,
                    }}
                  >
                    <BookOpen
                      size={16}
                      className="shrink-0"
                      style={{ color: ACCENT }}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {source.title}
                      </span>
                      <span
                        className="mt-0.5 block text-xs"
                        style={{ color: theme.muted }}
                      >
                        {source.category}
                      </span>
                    </span>

                    <ExternalLink
                      size={15}
                      className="shrink-0"
                      style={{ color: theme.muted }}
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
