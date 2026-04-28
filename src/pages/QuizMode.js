import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../hooks/usedecks';
import './Quizmode.css';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalize(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

export default function QuizMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeck, markStudied } = useDecks();
  const deck = getDeck(id);

  const [cards] = useState(() => deck ? shuffle(deck.cards) : []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!submitted && inputRef.current) inputRef.current.focus();
  }, [index, submitted]);

  if (!deck) return <div className="page"><p>Deck not found.</p></div>;
  if (deck.cards.length === 0) return (
    <div className="page study-empty">
      <p>No cards to quiz.</p>
      <button className="btn-primary" onClick={() => navigate(`/deck/${id}`)}>Add Cards</button>
    </div>
  );

  const card = cards[index];

  const submit = () => {
    if (!answer.trim()) return;
    const isCorrect = normalize(answer) === normalize(card.back);
    setCorrect(isCorrect);
    setSubmitted(true);
    setResults(prev => [...prev, { card, userAnswer: answer, correct: isCorrect }]);
  };

  const next = () => {
    setAnswer('');
    setSubmitted(false);
    if (index + 1 >= cards.length) {
      markStudied(id);
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  };

  if (done) {
    const score = results.filter(r => r.correct).length;
    const pct = Math.round((score / cards.length) * 100);
    return (
      <div className="page study-done-page">
        <div className="done-card">
          <div className={`done-score ${pct >= 70 ? 'score-good' : 'score-bad'}`}>{pct}%</div>
          <h1>Quiz Complete!</h1>
          <p>{score} out of {cards.length} correct</p>

          <div className="results-list">
            {results.map((r, i) => (
              <div key={i} className={`result-row ${r.correct ? 'result-correct' : 'result-wrong'}`}>
                <span className="result-icon">{r.correct ? '✓' : '✕'}</span>
                <div>
                  <p className="result-q">{r.card.front}</p>
                  {!r.correct && <p className="result-user">Your answer: {r.userAnswer}</p>}
                  <p className="result-ans">Correct: {r.card.back}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="done-actions">
            <button className="btn-ghost" onClick={() => navigate('/')}>Back to Decks</button>
            <button className="btn-primary" onClick={() => window.location.reload()}>Retry Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page study-page">
      <header className="header">
        <div className="header-inner">
          <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
          <span className="header-title">Quiz: {deck.title}</span>
          <span className="study-counter">{index + 1} / {cards.length}</span>
        </div>
      </header>

      <div className="progress-bar-wrap">
        <motion.div className="progress-bar-fill" animate={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <main className="quiz-main">
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.2 }}>

            <div className="quiz-card">
              <span className="card-label">Question {index + 1}</span>
              <p className="quiz-question">{card.front}</p>
            </div>

            <div className="quiz-input-wrap">
              <textarea
                ref={inputRef}
                rows={3}
                placeholder="Type your answer here..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                disabled={submitted}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitted ? next() : submit(); }}
                className={submitted ? (correct ? 'input-correct' : 'input-wrong') : ''}
              />

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    className={`feedback-box ${correct ? 'feedback-correct' : 'feedback-wrong'}`}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  >
                    {correct ? (
                      <p>Correct!</p>
                    ) : (
                      <>
                        <p className="correct-ans">Correct answer: <strong>{card.back}</strong></p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="quiz-actions">
                {!submitted ? (
                  <button className="btn-primary btn-full" onClick={submit} disabled={!answer.trim()}>
                    Submit Answer
                  </button>
                ) : (
                  <button className="btn-primary btn-full" onClick={next}>
                    {index + 1 < cards.length ? 'Next Question →' : 'See Results'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}