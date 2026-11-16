import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/usePortfolio';

export function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) { setVisible(true); return; }
    if (ref.current.getBoundingClientRect().top < window.innerHeight) return;
    setVisible(false);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.05 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);
  return <div ref={ref} className={`reveal ${className}`} data-visible={visible}>{children}</div>;
}
