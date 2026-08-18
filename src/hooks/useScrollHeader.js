import { useState, useEffect } from "react";

export function useScrollHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible when near the top
      if (currentScrollY < 60) {
        setIsVisible(true);
      }
      // Scrolling down: hide navbar
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      // Scrolling up: reveal navbar
      else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return isVisible;
}
