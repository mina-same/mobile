/**
 * ConversationIcons Component
 * 
 * Mobile-only component that shows conversation avatars/icons in a vertical strip
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { getInitials } from '../../../utils/helpers';

/**
 * Conversation icons component (mobile only)
 * 
 * @param {Object} props - Component props
 * @param {Array} props.employees - Array of employee objects
 * @param {string} props.selectedEmployeeId - Currently selected employee ID
 * @param {Function} props.onSelectEmployee - Employee selection callback
 * @returns {JSX.Element} ConversationIcons component
 */
const ConversationIcons = ({
  employees = [],
  selectedEmployeeId,
  onSelectEmployee,
}) => {
  const handleSelect = (employee) => {
    if (onSelectEmployee) {
      onSelectEmployee(employee);
    }
  };

  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="conversation-icons h-full bg-white border-r border-gray-200 overflow-y-auto">
      {employees.map((employee) => {
        const isSelected = employee.id === selectedEmployeeId;
        
        return (
          <button
            key={employee.id}
            type="button"
            onClick={() => handleSelect(employee)}
            className={`
              w-full p-3 flex flex-col items-center justify-center transition-all duration-200
              active:bg-gray-100 active:scale-95
              ${isSelected
                ? 'bg-gray-100 border-l-2 border-l-gray-900'
                : 'hover:bg-gray-50'
              }
            `}
            aria-current={isSelected ? 'true' : 'false'}
            aria-label={`Chat with ${employee.name}`}
            style={{ minHeight: '70px' }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm
                transition-all duration-200
                ${isSelected ? 'bg-gray-900 scale-105' : 'bg-gray-700'}
              `}>
                {getInitials(employee.name)}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-900 rounded-r"></div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Prop types for type checking
ConversationIcons.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  selectedEmployeeId: PropTypes.string,
  onSelectEmployee: PropTypes.func.isRequired,
};

export default ConversationIcons;

