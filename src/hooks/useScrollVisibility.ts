import { useEffect, useRef } from 'react';

export const useScrollVisibility = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout;

    const showScrollbar = () => {
      element.classList.add('scrolling');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 1500); // Hide scrollbar after 1.5 seconds of no scrolling
    };

    const handleScroll = () => {
      showScrollbar();
    };

    const handleWheel = (e: WheelEvent) => {
      // Only show scrollbar if there's actual scrollable content
      if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
        showScrollbar();
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    element.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleWheel);
      clearTimeout(timeoutId);
    };
  }, []);

  return scrollRef;
};
