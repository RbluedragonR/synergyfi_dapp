import { useEffect } from 'react';

export function useStaticPinObserver(stickyRef: React.RefObject<HTMLDivElement>, top = 0): void {
  useEffect(() => {
    const el = stickyRef.current;
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
      {
        threshold: [0, 1],
      },
    );
    el && observer.observe(el);
  }, [stickyRef]);
  useEffect(() => {
    const el = stickyRef.current;
    const mainContainer = document.getElementsByClassName('main-container')[0];
    mainContainer?.addEventListener('scroll', () => {
      if (el) {
        const stickyTop = mainContainer.getBoundingClientRect().top;
        const currentTop = el.getBoundingClientRect().top;
        el.classList.toggle('is-pinned', currentTop <= stickyTop + top);
      }
    });
  }, [stickyRef, top]);
}
export function useStickyObserver(selector: string, top = 0): void {
  useEffect(() => {
    const el = document.querySelector(selector);
    const mainContainer = document.getElementsByClassName('main-container')[0];
    mainContainer?.addEventListener('scroll', () => {
      if (el) {
        const stickyTop = mainContainer.getBoundingClientRect().top;
        const currentTop = el.getBoundingClientRect().top;
        el.classList.toggle('is-pinned', currentTop <= stickyTop + top);
      }
    });
  }, [selector, top]);
}
