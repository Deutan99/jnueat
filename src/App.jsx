import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import StartPage from './pages/StartPage';
import MainPage from './pages/MainPage';
import CategoriesPage from './pages/CategoriesPage';
import NearbyPage from './pages/NearbyPage';
import AIPage from './pages/AIPage';

export default function App() {
  return (
    <div className="h-full mx-auto max-w-md bg-white shadow-xl overflow-y-auto">
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
      </Routes>
      <Analytics />
    </div>
  );
}
