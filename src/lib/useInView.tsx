"use client";
import { useEffect, useRef, useState } from 'react';

export function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.2): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null as any);
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
