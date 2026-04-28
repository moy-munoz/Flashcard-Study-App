import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../hooks/usedecks';
import './Dashboard.css';

const SUBJECT_COLORS = {
  'Comp Sci': '#4F46E5',
  'History': '#0891B2',
  'Math': '#D97706',
  'Science': '#16A34A',
  'English': '#9333EA',
  'General': '#6B7280',
};

function getColor(subject) {
  return SUBJECT_COLORS[subject] || '#6B7280';
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never studied';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Studied today';
  if (days === 1) return 'Studied yesterday';
  return `Studied ${days} days ago`;
}

export default function Dashboard() {
  const { decks, createDeck, deleteDeck } = useDecks();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const id = createDeck(newTitle.trim(), newSubject);
    setNewTitle('');
    setNewSubject('General');
    setShowNew(false);
    navigate(`/deck/${id}`);
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-text">Study App</span>
          </div>
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            + New Deck
          </button>
        </div>
      </header>

      <main className="main">
        <div className="section-title">
          <h1>Your Decks</h1>
          <span className="deck-count">{decks.length} deck{decks.length !== 1 ? 's' : ''}</span>
        </div>

        {decks.length === 0 && (
          <div className="empty-state">
            <p>No decks yet. Create your first deck to get started!</p>
          </div>
        )}

        <div className="deck-grid">
          <AnimatePresence>
            {decks.map((deck, i) => (
              <motion.div
                key={deck.id}
                className="deck-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                style={{ '--accent': getColor(deck.subject) }}
              >
                <div className="deck-card-accent" />
                <div className="deck-card-body">
                  <div className="deck-subject-badge" style={{ background: 
                    getColor(deck.subject) + '20', color: getColor(deck.subject) }}>
                    {deck.subject}
                  </div>
                  <h2 className="deck-title">{deck.title}</h2>
                  <p className="deck-meta">
                    {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} · 
                    {timeAgo(deck.lastStudied)}
                  </p>
                </div>
                <div className="deck-card-actions">
                  <button className="btn-study" onClick={() => navigate(`/study/${deck.id}`)}>
                    Study
                  </button>
                  <button className="btn-quiz" onClick={() => navigate(`/quiz/${deck.id}`)}>
                    Quiz
                  </button>
                  <button className="btn-edit" onClick={() => navigate(`/deck/${deck.id}`)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => setDeleteConfirm(deck.id)}>
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showNew && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNew(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h2>Create New Deck</h2>
              <label>Deck Name</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Biology Chapter 5"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <label>Subject</label>
              <select value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} 
                disabled={!newTitle.trim()}>Create Deck</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div className="modal modal-sm" initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <h2>Delete Deck?</h2>
              <p>This will permanently delete this deck and all its cards.</p>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => { deleteDeck(deleteConfirm); 
                  setDeleteConfirm(null); }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}