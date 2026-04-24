import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeckEditor from './pages/Deckeditor';
import StudyMode from './pages/StudyMode';
import QuizMode from './pages/QuizMode';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/deck/:id" element={<DeckEditor />} />
        <Route path="/study/:id" element={<StudyMode />} />
        <Route path="/quiz/:id" element={<QuizMode />} />
      </Routes>
    </Router>
  );
}

export default App;