import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Techers';
import AddEditTeacher from './pages/AddEditTeacher';
import Analytics from './pages/Analytics';
import ProtectedRoute from "./routes/ProtectedRoute";
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
      <Route path="/teacher/:id?" element={<ProtectedRoute><AddEditTeacher /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
