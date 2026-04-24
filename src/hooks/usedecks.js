import { useState, useEffect } from 'react';

const STORAGE_KEY = 'flashcard_decks';

export function useDecks() {
  const [decks, setDecks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  const createDeck = (title, subject) => {
    const newDeck = {
      id: Date.now().toString(),
      title,
      subject: subject || 'General',
      createdAt: new Date().toISOString(),
      lastStudied: null,
      cards: []
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const updateDeck = (id, updates) => {
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDeck = (id) => {
    setDecks(prev => prev.filter(d => d.id !== id));
  };

  const getDeck = (id) => decks.find(d => d.id === id);

  const addCard = (deckId, front, back) => {
    const card = { id: Date.now().toString(), front, back };
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
    ));
  };

  const updateCard = (deckId, cardId, front, back) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId
        ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, front, back } : c) }
        : d
    ));
  };

  const deleteCard = (deckId, cardId) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
    ));
  };

  const markStudied = (deckId) => {
    setDecks(prev => prev.map(d =>
      d.id === deckId ? { ...d, lastStudied: new Date().toISOString() } : d
    ));
  };

  return { decks, createDeck, updateDeck, deleteDeck, getDeck, addCard, updateCard, deleteCard, markStudied };
}