import './App.css';
import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import VideoCompo from './components/VideoCompo';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import ResourcesPage from './pages/ResourcesPage';
import PricingPage from './pages/PricingPage';
import GetStartedPage from './pages/GetStartedPage';
import NotFoundPage from './pages/NotFoundPage';

function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/video" element={<VideoCompo />} />
        <Route path="/video/:roomId" element={<VideoCompo />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
