import { NavLink, Route, Routes } from 'react-router-dom';
import CurrentStatus from './pages/CurrentStatus';
import History from './pages/History';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Mülheim Termin — Availability</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Current Status
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
            Historical Analysis
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CurrentStatus />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}
