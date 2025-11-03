/**
 * Dashboard Page
 * 
 * Main dashboard view displaying feedback data and analytics
 * Includes real-time score chart and feedback table
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import useFeedback from '../../hooks/useFeedback'; // Real API hook
import { filterFeedback } from '../../utils/helpers';
import ScoreChart from '../../components/dashboard/ScoreChart';
import FeedbackTable from '../../components/dashboard/FeedbackTable';
import SearchBar from '../../components/dashboard/SearchBar';
import Loading from '../../components/common/Loading';
import './Dashboard.module.css';

/**
 * Dashboard page component
 * 
 * @returns {JSX.Element} Dashboard page
 */
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch feedback data with real-time updates
  const {
    feedback,
    loading,
    error,
    scoreDistribution,
    feedbackCount,
  } = useFeedback({ realtime: true });
  
  /**
   * Filters feedback based on search query
   */
  const filteredFeedback = useMemo(() => {
    return filterFeedback(feedback, searchQuery);
  }, [feedback, searchQuery]);
  
  /**
   * Handles search query change
   * 
   * @param {string} query - Search query
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  /**
   * Handles feedback row click
   * Can be extended to show detailed view
   * 
   * @param {Object} feedbackItem - Feedback item clicked
   */
  const handleFeedbackClick = (feedbackItem) => {
    console.log('Feedback clicked:', feedbackItem);
    // TODO: Implement detailed view or modal
  };
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Employee feedback overview and analytics
          </p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Score Distribution Chart */}
        <ScoreChart
          scoreDistribution={scoreDistribution}
          loading={loading}
        />
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Feedback Records
          </h2>
          
          {/* Search Bar */}
          <div className="w-full sm:w-auto sm:min-w-[280px] md:w-96">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredFeedback.length === 0 ? (
              <span className="text-gray-500">No results found for "{searchQuery}"</span>
            ) : (
              <span>
                Showing {filteredFeedback.length} of {feedbackCount} results
                {filteredFeedback.length !== feedbackCount && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Feedback Table */}
      <FeedbackTable
        feedback={filteredFeedback}
        loading={loading}
        onRowClick={handleFeedbackClick}
      />
    </div>
  );
};

export default Dashboard;

