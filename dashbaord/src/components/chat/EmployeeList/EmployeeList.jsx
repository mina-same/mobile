/**
 * EmployeeList Component
 * 
 * Displays a list of employees to chat with
 * Shows last message preview and timestamp
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { formatChatDate } from '../../../utils/dateFormatter';
import { truncateString, getInitials } from '../../../utils/helpers';
import Loading from '../../common/Loading';
import './EmployeeList.module.css';

/**
 * Employee list component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.employees - Array of employee objects
 * @param {string} props.selectedEmployeeId - Currently selected employee ID
 * @param {Function} props.onSelectEmployee - Employee selection callback
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} EmployeeList component
 */
const EmployeeList = ({
  employees = [],
  selectedEmployeeId,
  onSelectEmployee,
  loading = false,
}) => {
  /**
   * Handles employee selection
   * 
   * @param {Object} employee - Employee object
   */
  const handleSelect = (employee) => {
    if (onSelectEmployee) {
      onSelectEmployee(employee);
    }
  };
  
  // Loading state - don't show loading message
  if (loading && (!employees || employees.length === 0)) {
    return (
      <div className="overflow-y-auto h-full bg-white">
        <div className="px-4 py-3.5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide leading-tight">
            Messages
          </h2>
        </div>
      </div>
    );
  }
  
  // No employees state
  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-sm font-medium text-gray-900 mb-2">No Conversations</h3>
        <p className="text-xs text-gray-500">
          No active conversations yet. Conversations will appear here once you start chatting with employees.
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto h-full bg-white">
      {/* Employee List Header */}
      <div className="px-4 py-[23px] border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide leading-tight">
          Messages ({employees.length})
        </h2>
      </div>
      
      {/* Employee Items */}
      <div>
        {employees.map((employee) => {
          const isSelected = employee.id === selectedEmployeeId;
          
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => handleSelect(employee)}
              className={`
                w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 text-left border-l-2
                ${isSelected
                  ? 'bg-gray-50 border-l-gray-900'
                  : 'hover:bg-gray-50 border-l-transparent'
                }
              `}
              aria-current={isSelected ? 'true' : 'false'}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className={`
                  w-11 h-11 rounded-full flex items-center justify-center text-white font-medium text-sm
                  ${isSelected ? 'bg-gray-900' : 'bg-gray-700'}
                `}>
                  {getInitials(employee.name)}
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Time Row */}
                <div className="flex items-baseline justify-between mb-1">
                  <p className={`
                    text-sm font-semibold truncate
                    ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                  `}>
                    {employee.name}
                  </p>
                  {employee.lastMessageTimestamp && (
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatChatDate(employee.lastMessageTimestamp)}
                    </p>
                  )}
                </div>
                
                {/* Last Message */}
                {employee.lastMessage && (() => {
                  const message = employee.lastMessage;
                  const isImage = message.includes('📷');
                  const isFile = message.includes('📄');
                  
                  if (isImage || isFile) {
                    // Extract file name (everything after the emoji)
                    const emojiMatch = message.match(/(📷|📄)\s*(.+?)(\s*\(\+\d+\))?$/);
                    const fileName = emojiMatch ? emojiMatch[2] : '';
                    const multipleCount = message.match(/\(\+(\d+)\)/)?.[1];
                    // Extract text before the emoji (if any)
                    const textBefore = message.split(/(📷|📄)/)[0].trim();
                    
                    return (
                      <div className={`
                        text-xs flex items-center gap-1
                        ${isSelected ? 'text-gray-600 font-medium' : 'text-gray-500'}
                      `}>
                        {/* Icon */}
                        <span className="flex-shrink-0 w-3 h-3 flex items-center justify-center" aria-hidden="true">
                          {isImage ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </span>
                        {/* File name and text */}
                        <span className="truncate flex-1 min-w-0">
                          {textBefore && <span className="mr-0.5">{textBefore}</span>}
                          <span>{truncateString(fileName, 30)}</span>
                          {multipleCount && <span className="ml-0.5">(+{multipleCount})</span>}
                        </span>
                      </div>
                    );
                  }
                  
                  // Regular text message
                  return (
                    <p className={`
                      text-xs truncate
                      ${isSelected ? 'text-gray-600 font-medium' : 'text-gray-500'}
                    `}>
                      {truncateString(message, 35)}
                    </p>
                  );
                })()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Prop types for type checking
EmployeeList.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      lastMessage: PropTypes.string,
      lastMessageTimestamp: PropTypes.any,
    })
  ),
  selectedEmployeeId: PropTypes.string,
  onSelectEmployee: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default EmployeeList;

