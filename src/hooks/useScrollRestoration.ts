import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const key = location.pathname + location.search;

    // Save scroll position before leaving
    if (prevPathRef.current && prevPathRef.current !== key) {
      scrollPositions.set(prevPathRef.current, window.scrollY);
    }

    // Handle hash/anchor links
    if (location.hash) {
      requestAnimationFrame(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "auto" });
        }
      });
      prevPathRef.current = key;
      return;
    }

    // POP = back/forward navigation
    if (navigationType === "POP") {
      const savedPosition = scrollPositions.get(key);
      if (savedPosition !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
    } else {
      // PUSH or REPLACE = new navigation, scroll to top
      window.scrollTo(0, 0);
    }

    prevPathRef.current = key;
  }, [location.pathname, location.search, location.hash, navigationType]);
}
