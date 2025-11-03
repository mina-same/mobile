/**
 * ScrollToTop Component
 * 
 * Scrolls to the top of the page when the route changes
 * 
 * @component
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to top on route change
 * 
 * @returns {null} Renders nothing
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also scroll main content area to top if it exists
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;






