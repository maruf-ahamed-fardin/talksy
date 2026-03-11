import './App.css';
import { useEffect, useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import VideoCompo from './components/VideoCompo';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import ResourcesPage from './pages/ResourcesPage';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import GetStartedPage from './pages/GetStartedPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

const SCROLL_REVEAL_SELECTOR = [
  '.hero-copy',
  '.hero-visual',
  '.brand-copy',
  '.brand-grid > *',
  '.testimonial-section .section-note',
  '.testimonial-section .section-title',
  '.testimonial-grid > *',
  '.testimonial-link-row',
  '.faq-section > .eyebrow',
  '.faq-section > .section-title',
  '.faq-section > .section-copy',
  '.faq-item',
  '.faq-footer',
  '.page-hero',
  '.page-grid > *',
  '.page-band > *',
  '.timeline-grid > *',
  '.pricing-grid > *',
  '.page-cta',
  '.room-screen',
  '.room-sidebar > *',
  '.chat-panel',
  '.chat-sidebar > *',
  '.history-summary-grid > *',
  '.history-list-panel',
  '.history-detail-card',
  '.newsletter-card',
  '.footer-column',
  '.not-found',
].join(', ');

function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useLayoutEffect(() => {
    const targets = Array.from(document.querySelectorAll(SCROLL_REVEAL_SELECTOR));

    if (!targets.length) {
      return undefined;
    }

    targets.forEach((target, index) => {
      target.classList.add('scroll-reveal');
      target.style.setProperty('--reveal-delay', `${(index % 4) * 80}ms`);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((target) => target.classList.add('is-visible'));

      return () => {
        targets.forEach((target) => {
          target.classList.remove('scroll-reveal', 'is-visible');
          target.style.removeProperty('--reveal-delay');
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove('scroll-reveal', 'is-visible');
        target.style.removeProperty('--reveal-delay');
      });
    };
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
        <Route path="/support" element={<ChatPage />} />
        <Route path="/chat" element={<Navigate replace to="/support" />} />
        <Route path="/history" element={<HistoryPage />} />
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
