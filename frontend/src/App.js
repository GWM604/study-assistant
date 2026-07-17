import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SolveProblem from './pages/SolveProblem';
import SolutionDetail from './pages/SolutionDetail';
import Premium from './pages/Premium';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" />;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
        <Route path="/solve" element={<ProtectedRoute element={<SolveProblem user={user} />} />} />
        <Route path="/solution/:id" element={<ProtectedRoute element={<SolutionDetail user={user} />} />} />
        <Route path="/premium" element={<ProtectedRoute element={<Premium user={user} setUser={setUser} />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile user={user} setUser={setUser} />} />} />
      </Routes>
    </Router>
  );
}

export default App;
