import { createContext, useContext, useEffect, useState } from 'react';
import { messages } from '../i18n/messages';

const PortfolioContext = createContext(null);
const saved = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};

export function PortfolioProvider({ children }) {
  const [lang, setLang] = useState(() => saved('tv-language', 'en') === 'vi' ? 'vi' : 'en');
  const [theme, setTheme] = useState(() => saved('tv-theme', 'dark') === 'light' ? 'light' : 'dark');
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'vi' ? 'Thân Đức Việt — Portfolio RTL Design & FPGA' : 'Thân Đức Việt — RTL Design & FPGA Portfolio';
    document.querySelector('meta[name="description"]')?.setAttribute('content', lang === 'vi'
      ? 'Portfolio Thân Đức Việt, sinh viên Thiết kế vi mạch HCM-UTE, tìm cơ hội thực tập RTL Design. AES-256, Floating-Point ALU và TinyML FPGA.'
      : 'Thân Đức Việt’s digital hardware portfolio. HCM-UTE student seeking an RTL Design internship. AES-256, Floating-Point ALU and TinyML FPGA.');
    try { localStorage.setItem('tv-language', lang); } catch { /* Preferences are optional. */ }
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080b14' : '#f6f7fc');
    try { localStorage.setItem('tv-theme', theme); } catch { /* Preferences are optional. */ }
  }, [theme]);
  return <PortfolioContext.Provider value={{ lang, setLang, theme, setTheme, t: messages[lang], text: (value) => typeof value === 'object' ? value[lang] : value }}>{children}</PortfolioContext.Provider>;
}

export const usePortfolio = () => useContext(PortfolioContext);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}
