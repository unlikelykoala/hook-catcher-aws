/**
  Keep track of scroll direction to determine if an element should be hidden or not
 */

import { useState, useRef, useEffect } from "react";

export function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 64);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
