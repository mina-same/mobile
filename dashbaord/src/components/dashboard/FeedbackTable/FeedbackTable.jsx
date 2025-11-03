/**
 * FeedbackTable Component
 * 
 * Displays feedback data in a sortable, paginated table
 * Shows date, employee name, score, and notes snippet
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatFeedbackDate } from '../../../utils/dateFormatter';
import { truncateString, sortByField } from '../../../utils/helpers';
import { SCORE_CONFIG } from '../../../config/constants';
import Loading from '../../common/Loading';
import './FeedbackTable.module.css';

/**
 * Feedback table component with sorting and pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.feedback - Array of feedback objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRowClick - Row click handler
 * @returns {JSX.Element} FeedbackTable component
 */
const FeedbackTable = ({ feedback = [], loading = false, onRowClick }) => {
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  /**
   * Sorts the feedback data based on current sort field and order
   */
  const sortedFeedback = useMemo(() => {
    if (!feedback || feedback.length === 0) return [];
    
    return sortByField(feedback, sortField, sortOrder);
  }, [feedback, sortField, sortOrder]);
  
  /**
   * Handles column header click to change sorting
   * 
   * @param {string} field - Field to sort by
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  /**
   * Handles row click
   * 
   * @param {Object} feedbackItem - Feedback item clicked
   */
  const handleRowClick = (feedbackItem) => {
    if (onRowClick) {
      onRowClick(feedbackItem);
    }
  };
  
  /**
   * Renders sort icon for column headers
   * 
   * @param {string} field - Field name
   * @returns {JSX.Element} Sort icon
   */
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  /**
   * Renders score as text (e.g., "5 stars")
   * 
   * @param {number} score - Score value
   * @returns {JSX.Element} Score text
   */
  const renderScore = (score) => {
    const starText = score === 1 ? 'star' : 'stars';
    
    return (
      <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-md">
        <span className="text-sm font-medium text-gray-700">
          {score} {starText}
        </span>
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" message="Loading feedback data..." />
        </div>
      </div>
    );
  }
  
  // No data state
  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            There is no feedback data available. Try adjusting your search or filters.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Date Column */}
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              
              {/* Employee Name Column */}
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('employeeName')}
              >
                <div className="flex items-center space-x-1">
                  <span className="hidden sm:inline">Employee</span>
                  <span className="sm:hidden">Name</span>
                  {renderSortIcon('employeeName')}
                </div>
              </th>
              
              {/* Score Column */}
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Score</span>
                  {renderSortIcon('score')}
                </div>
              </th>
              
              {/* Notes Column */}
              <th
                scope="col"
                className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Notes
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFeedback.map((item, index) => (
              <tr
                key={item.id || index}
                className={`
                  transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                `}
                onClick={() => handleRowClick(item)}
              >
                {/* Date */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="hidden sm:inline">{item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A'}</span>
                  <span className="sm:hidden">{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                </td>
                
                {/* Employee Name */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {item.employeeName || 'Unknown'}
                  </span>
                </td>
                
                {/* Score */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  {renderScore(item.score)}
                </td>
                
                {/* Notes */}
                <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-md">
                  <p className="leading-relaxed line-clamp-2">
                    {item.notes || 'No notes provided'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Prop types for type checking
FeedbackTable.propTypes = {
  feedback: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.any,
      employeeName: PropTypes.string,
      score: PropTypes.number,
      notes: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default FeedbackTable;

