/**
 * MainLayout Component
 * 
 * Main layout wrapper that includes Header, Sidebar, and content area
 * Provides consistent structure for all pages
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Header';
import Sidebar from '../Sidebar';
import './MainLayout.module.css';

/**
 * Main layout component that wraps page content
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {JSX.Element} MainLayout component
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main
        className="transition-all duration-300"
        style={{
          marginTop: 'var(--header-height)',
          minHeight: 'calc(100vh - var(--header-height))',
        }}
      >
        {/* Content Container */}
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Prop types for type checking
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;

