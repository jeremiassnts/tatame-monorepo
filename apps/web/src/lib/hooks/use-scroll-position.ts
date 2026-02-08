"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 10;

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = typeof window !== "undefined" ? window.scrollY : 0;
      setScrollY(y);
      setIsScrolled(y > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollY, isScrolled };
}
