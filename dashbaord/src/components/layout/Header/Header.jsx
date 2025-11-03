/**
 * Header Component
 * 
 * Top navigation bar with logo and title
 * Displays the application branding and navigation
 * Responsive with mobile menu toggle
 * 
 * @component
 */

import React from 'react';
import styles from './Header.module.css';

/**
 * Header component for the top navigation bar
 * 
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  const toggleMobileMenu = () => {
    document.body.classList.toggle('mobile-menu-open');
  };

  return (
    <header className={`${styles.header} fixed top-0 left-0 right-0 z-40`} style={{ height: 'var(--header-height)' }}>
      <div className="container h-full">
        <div className={`${styles.headerContent} h-full flex items-center gap-4 justify-between`}>
          {/* Title - On the left */}
          <h1 className={`${styles.title} hidden sm:block`}>
            HR Feedback Admin Panel
          </h1>
          
          {/* Mobile Title */}
          <h1 className={`${styles.mobileTitle} sm:hidden`}>
            HR Feedback
          </h1>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`${styles.menuButton} lg:hidden`}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* User Profile - Desktop */}
            <div className={`${styles.userProfile} hidden lg:flex items-center gap-3`}>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">HR Personnel</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <div className={`${styles.avatar} w-11 h-11 rounded-full flex items-center justify-center`}>
                <span className="text-gray-700 font-semibold text-sm">HR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

