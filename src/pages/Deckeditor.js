import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../hooks/usedecks';
import './Deckeditor.css';

export default function DeckEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeck, updateDeck, addCard, updateCard, deleteCard } = useDecks();
  const deck = getDeck(id);

  const [editingCard, setEditingCard] = useState(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [editingDeckName, setEditingDeckName] = useState(false);
  const [deckTitle, setDeckTitle] = useState(deck?.title || '');

  if (!deck) return <div className="page"><p>Deck not found.</p></div>;

  const openNew = () => {
    setEditingCard('new');
    setFront('');
    setBack('');
  };

  const openEdit = (card) => {
    setEditingCard(card.id);
    setFront(card.front);
    setBack(card.back);
  };

  const save = () => {
    if (!front.trim() || !back.trim()) return;
    if (editingCard === 'new') {
      addCard(id, front.trim(), back.trim());
    } else {
      updateCard(id, editingCard, front.trim(), back.trim());
    }
    setEditingCard(null);
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
          <div className="header-actions">
            <button className="btn-outline" onClick={() => navigate(`/study/${id}`)}>Study</button>
            <button className="btn-primary" onClick={() => navigate(`/quiz/${id}`)}>Quiz</button>
          </div>
        </div>
      </header>

      <main className="editor-main">
        <div className="editor-header">
          {editingDeckName ? (
            <div className="deck-name-edit">
              <input
                autoFocus
                value={deckTitle}
                onChange={e => setDeckTitle(e.target.value)}
                onBlur={() => { updateDeck(id, { title: deckTitle }); setEditingDeckName(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { updateDeck(id, { title: deckTitle }); setEditingDeckName(false); } }}
              />
            </div>
          ) : (
            <h1 className="editor-title" onClick={() => setEditingDeckName(true)}>
              {deck.title} <span className="edit-hint">✎</span>
            </h1>
          )}
          <p className="editor-meta">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} · Click title to rename</p>
        </div>

        <button className="add-card-btn" onClick={openNew}>+ Add Card</button>

        <div className="card-list">
          <AnimatePresence>
            {deck.cards.map((card, i) => (
              <motion.div
                key={card.id}
                className="card-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="card-row-num">{i + 1}</div>
                <div className="card-row-content">
                  <p className="card-front-text">{card.front}</p>
                  <p className="card-back-text">{card.back}</p>
                </div>
                <div className="card-row-actions">
                  <button className="btn-icon" onClick={() => openEdit(card)}>✎</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => deleteCard(id, card.id)}>✕</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {deck.cards.length === 0 && (
            <div className="empty-cards">
              <p>No cards yet. Click "+ Add Card" to create your first one.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {editingCard && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditingCard(null)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h2>{editingCard === 'new' ? 'Add Card' : 'Edit Card'}</h2>
              <label>Front (Question / Term)</label>
              <textarea
                autoFocus
                placeholder="What is the question?"
                value={front}
                onChange={e => setFront(e.target.value)}
                rows={3}
              />
              <label>Back (Answer / Definition)</label>
              <textarea
                placeholder="What is the answer?"
                value={back}
                onChange={e => setBack(e.target.value)}
                rows={4}
              />
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setEditingCard(null)}>Cancel</button>
                <button className="btn-primary" onClick={save} disabled={!front.trim() || !back.trim()}>
                  {editingCard === 'new' ? 'Add Card' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}