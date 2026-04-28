import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../hooks/usedecks';
import './Studymode.css';

export default function StudyMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeck, markStudied } = useDecks();
  const deck = getDeck(id);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);

  if (!deck) return <div className="page"><p>Deck not found.</p></div>;
  if (deck.cards.length === 0) return (
    <div className="page">
      <div className="study-empty">
        <p>This deck has no cards.</p>
        <button className="btn-primary" onClick={() => navigate(`/deck/${id}`)}>Add Cards</button>
      </div>
    </div>
  );

  const card = deck.cards[index];
  const progress = index / deck.cards.length;

  const goNext = (status) => {
    if (status === 'known') setKnown(prev => [...prev, card.id]);
    else setLearning(prev => [...prev, card.id]);

    setFlipped(false);
    setDirection(1);

    setTimeout(() => {
      if (index + 1 >= deck.cards.length) {
        markStudied(id);
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 150);
  };

  const goPrev = () => {
    if (index === 0) return;
    setFlipped(false);
    setDirection(-1);
    setTimeout(() => setIndex(i => i - 1), 150);
  };

  if (done) {
    return (
      <div className="page study-done-page">
        <div className="done-card">
          <h1>Session Complete!</h1>
          <p>You reviewed all {deck.cards.length} cards.</p>
          <div className="done-stats">
            <div className="stat-pill stat-green">
              <span>{known.length}</span> Got it
            </div>
            <div className="stat-pill stat-amber">
              <span>{learning.length}</span> Still learning
            </div>
          </div>
          <div className="done-actions">
            <button className="btn-ghost" onClick={() => navigate('/')}>Back to Decks</button>
            <button className="btn-primary" onClick={() => navigate(`/quiz/${id}`)}>Take Quiz</button>
            <button className="btn-outline" onClick={() => 
              { setIndex(0); setFlipped(false); setKnown([]); setLearning([]); setDone(false); }}>
              Study Again
            </button>
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
          <span className="header-title">{deck.title}</span>
          <span className="study-counter">{index + 1} / {deck.cards.length}</span>
        </div>
      </header>

      <div className="progress-bar-wrap">
        <motion.div className="progress-bar-fill" animate={{ width: `${progress * 100}%` }} />
      </div>

      <main className="study-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flip-container"
            onClick={() => setFlipped(f => !f)}
          >
            <motion.div
              className="flashcard"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="card-face card-front">
                <span className="card-label">Question</span>
                <p>{card.front}</p>
                <span className="flip-hint">Tap to reveal answer</span>
              </div>
              <div className="card-face card-back">
                <span className="card-label">Answer</span>
                <p>{card.back}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {flipped && (
            <motion.div className="study-actions" initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}>
              <button className="btn-learning" onClick={() => goNext('learning')}>
                Still Learning
              </button>
              <button className="btn-known" onClick={() => goNext('known')}>
                Got It
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="nav-actions">
          <button className="btn-nav" onClick={goPrev} disabled={index === 0}>← Prev</button>
          <button className="btn-nav" onClick={() => goNext('skip')}>Skip →</button>
        </div>
      </main>
    </div>
  );
}