"use client";
import { useEffect, useRef, useState } from 'react';

export default function useInView(threshold = 0.2): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  // Default to false so animation always triggers on scroll
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
