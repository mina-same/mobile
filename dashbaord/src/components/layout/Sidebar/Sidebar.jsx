/**
 * Sidebar Component
 * 
 * Vertical navigation sidebar with links to different pages
 * Highlights the active route
 * 
 * @component
 */

import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import logoIcon from '../../../assets/icon.png';
import styles from './Sidebar.module.css';

/**
 * Sidebar navigation component
 * 
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = () => {
  const location = useLocation();
  
  /**
   * Navigation items configuration
   */
  const navItems = [
    {
      to: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      to: ROUTES.CHAT,
      label: 'Chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
  ];
  
  /**
   * Determines if a nav link is active
   * 
   * @param {string} path - Route path to check
   * @returns {boolean} True if the route is active
   */
  const isActive = (path) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path || location.pathname === ROUTES.HOME;
    }
    return location.pathname === path;
  };

  /**
   * Scrolls to the top of the page when navigating
   */
  const handleNavigation = () => {
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also scroll main content area to top if it exists
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Close mobile menu on navigation
    if (window.innerWidth < 1024) {
      document.body.classList.remove('mobile-menu-open');
    }
  };
  
  return (
    <>
      {/* Backdrop for mobile/tablet */}
      <div 
        className="sidebar-backdrop"
        onClick={() => document.body.classList.remove('mobile-menu-open')}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className="sidebar-menu flex flex-col">
        {/* Sidebar Header - Logo and HR Admin */}
        <div className={styles.sidebarHeader}>
          <Link 
            to={ROUTES.DASHBOARD} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={handleNavigation}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
              <img src={logoIcon} alt="HR Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-sm font-semibold text-gray-900">HR Admin</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActive(item.to);
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }
                `}
                aria-current={active ? 'page' : undefined}
                onClick={handleNavigation}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                
                {/* Label */}
                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* HR Profile - Shown only on mobile/tablet at bottom of sidebar */}
        <div className="lg:hidden border-t border-gray-200 bg-gray-50 p-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-gray-700 font-semibold text-sm">HR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">HR Personnel</span>
              <span className="text-xs text-gray-500">Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

