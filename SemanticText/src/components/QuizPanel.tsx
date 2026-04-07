import { useState } from "react";
import "./QuizPanel.css";

interface Question {
  id: number;
  text: string;
  hint: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which city were The Beatles formed in?",
    hint: "Depth 1 (skeleton) — Origins section",
    options: ["London", "Manchester", "Liverpool", "Hamburg"],
    correct: 2,
  },
  {
    id: 2,
    text: "How many viewers watched The Beatles' appearance on The Ed Sullivan Show in February 1964?",
    hint: "Depth 2 — Cultural Impact section",
    options: ["12 million", "35 million", "73 million", "100 million"],
    correct: 2,
  },
  {
    id: 3,
    text: "How many studio albums did The Beatles release during their career?",
    hint: "Depth 2 — Disbandment and Legacy section",
    options: ["9", "11", "13", "15"],
    correct: 2,
  },
  {
    id: 4,
    text: "How many musicians were in the orchestra that played the famous crescendo closing 'A Day in the Life'?",
    hint: "Depth 3 (full expansion required) — Musical Career section",
    options: ["21 musicians", "35 musicians", "41 musicians", "52 musicians"],
    correct: 2,
  },
  {
    id: 5,
    text: "What nickname is often given to producer George Martin in relation to The Beatles?",
    hint: "Depth 3 + click the 'George Martin' term — Origins section",
    options: [
      "The Silent Partner",
      "The Sixth Beatle",
      "The Hidden Hand",
      "The Fifth Beatle",
    ],
    correct: 3,
  },
];

export default function QuizPanel() {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((q) => selected[q.id] !== undefined);

  const score = submitted
    ? QUESTIONS.filter((q) => selected[q.id] === q.correct).length
    : 0;

  function handleSelect(questionId: number, optionIndex: number) {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleSubmit() {
    if (allAnswered) setSubmitted(true);
  }

  function handleReset() {
    setSelected({});
    setSubmitted(false);
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-header">
        <h2 className="quiz-title">Comprehension Quiz</h2>
        <p className="quiz-subtitle">
          Use the reader on the left to find the answers. Hover over a question
          number for a hint.
        </p>
      </div>

      <ol className="quiz-questions">
        {QUESTIONS.map((q) => {
          const isCorrect = submitted && selected[q.id] === q.correct;

          return (
            <li
              key={q.id}
              className={`quiz-question ${submitted ? (isCorrect ? "quiz-question--correct" : "quiz-question--wrong") : ""}`}
            >
              <div className="quiz-question-header">
                <span className="quiz-q-number" title={q.hint} aria-label={`Question ${q.id} — hint: ${q.hint}`}>
                  Q{q.id}
                </span>
              </div>
              <p className="quiz-q-text">{q.text}</p>
              <fieldset className="quiz-options" disabled={submitted}>
                <legend className="sr-only">Options for question {q.id}</legend>
                {q.options.map((opt, i) => {
                  const isSelected = selected[q.id] === i;
                  const isCorrectOption = submitted && i === q.correct;
                  const isWrongSelection = submitted && isSelected && !isCorrectOption;
                  return (
                    <label
                      key={i}
                      className={`quiz-option ${isSelected ? "quiz-option--selected" : ""} ${isCorrectOption ? "quiz-option--correct" : ""} ${isWrongSelection ? "quiz-option--wrong" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q${q.id}`}
                        value={i}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, i)}
                      />
                      <span className="quiz-option-text">{opt}</span>
                      {isCorrectOption && (
                        <span className="quiz-option-mark quiz-option-mark--correct">✓</span>
                      )}
                      {isWrongSelection && (
                        <span className="quiz-option-mark quiz-option-mark--wrong">✗</span>
                      )}
                    </label>
                  );
                })}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="quiz-footer">
        {!submitted ? (
          <button
            className="quiz-submit-btn"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Submit answers
          </button>
        ) : (
          <div className="quiz-result">
            <div className={`quiz-score ${score === QUESTIONS.length ? "quiz-score--perfect" : score >= 3 ? "quiz-score--good" : "quiz-score--low"}`}>
              {score} / {QUESTIONS.length} correct
            </div>
            <p className="quiz-result-msg">
              {score === QUESTIONS.length
                ? "Perfect score — you zoomed to exactly the right depth every time."
                : score >= 3
                  ? "Good job! Check the highlighted answers to see what you missed."
                  : "Try re-reading with the Semantic view and zooming deeper into each section."}
            </p>
            <button className="quiz-reset-btn" onClick={handleReset}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
