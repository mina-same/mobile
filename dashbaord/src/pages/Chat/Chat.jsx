/**
 * Chat Page
 * 
 * Chat interface for HR to communicate with employees
 * Displays employee list and chat window side-by-side
 * 
 * @component
 */

import React from 'react';
import useChat from '../../hooks/useChat'; // Real API hook
import useFeedback from '../../hooks/useFeedback'; // Real API hook
import EmployeeList from '../../components/chat/EmployeeList';
import ConversationIcons from '../../components/chat/ConversationIcons';
import ChatWindow from '../../components/chat/ChatWindow';
import { getUniqueEmployeeNames } from '../../utils/helpers';
import './Chat.module.css';

/**
 * Chat page component
 * 
 * @returns {JSX.Element} Chat page
 */
const Chat = () => {
  // Get feedback data to extract employee names
  const { feedback, loading: feedbackLoading } = useFeedback({ realtime: false });
  
  // Get chat functionality
  const {
    selectedEmployee,
    employeeList,
    messages,
    loading: chatLoading,
    isLoadingMessages,
    sendingMessage,
    sendHRMessage,
    selectEmployee,
    clearSelection,
    error,
  } = useChat({ realtime: true });
  
  // State to track if we're on mobile and should show chat window
  const [showChatWindow, setShowChatWindow] = React.useState(false);
  
  // Check if mobile (client-side only)
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Show chat window when employee is selected
  React.useEffect(() => {
    setShowChatWindow(!!selectedEmployee);
  }, [selectedEmployee]);
  
  // Detect mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  /**
   * Get unique employee names from feedback
   * These employees can be selected for chat
   */
  const availableEmployees = React.useMemo(() => {
    // Start with employees from conversations
    const allEmployees = [...employeeList];
    
    // Add employees from feedback who don't have conversations yet
    const names = getUniqueEmployeeNames(feedback);
    names.forEach((name) => {
      const exists = allEmployees.some((emp) => emp.name === name);
      if (!exists) {
        allEmployees.push({
          id: `emp_${name.toLowerCase().replace(/\s+/g, '_')}`,
          name,
          lastMessage: null,
          lastMessageTimestamp: null,
        });
      }
    });
    
    // Debug logging
    console.log('Available employees:', {
      conversationsCount: employeeList.length,
      feedbackNamesCount: names.length,
      totalEmployees: allEmployees.length,
      employees: allEmployees,
    });
    
    return allEmployees;
  }, [feedback, employeeList]);
  
  /**
   * Handles employee selection
   * 
   * @param {Object} employee - Employee object
   */
  const handleSelectEmployee = async (employee) => {
    if (!employee || !employee.name) {
      console.error('Invalid employee object:', employee);
      return;
    }
    
    // If already selected, don't do anything
    if (selectedEmployee === employee.name) {
      return;
    }
    
    await selectEmployee(employee.name);
    // showChatWindow is automatically updated by useEffect when selectedEmployee changes
  };
  
  /**
   * Handles back button click (mobile only)
   */
  const handleBackToList = () => {
    clearSelection();
    setShowChatWindow(false);
  };
  
  /**
   * Handles message send
   * 
   * @param {string} messageText - Message text
   * @param {Array} attachments - Array of attachment objects
   */
  const handleSendMessage = async (messageText, attachments = []) => {
    try {
      await sendHRMessage(messageText, attachments);
    } catch (err) {
      console.error('Error sending message:', err);
      // Error handling is managed by the hook
    }
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
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Chat</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time messaging with employees
          </p>
        </div>
      </div>
      
      {/* Chat Interface */}
      <div 
        className={`bg-white rounded-lg shadow-md overflow-hidden chat-container ${showChatWindow ? 'mobile-chat-active' : ''}`} 
        style={{ 
          height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 280px)', 
          minHeight: isMobile ? 'calc(100vh - 180px)' : '600px',
          maxHeight: isMobile ? 'calc(100vh - 180px)' : 'none',
        }}
      >
        <div className="flex h-full chat-layout">
          {/* Mobile: Conversation Icons Only */}
          {isMobile && (
            <ConversationIcons
              employees={availableEmployees}
              selectedEmployeeId={selectedEmployee ? `emp_${selectedEmployee.toLowerCase().replace(/\s+/g, '_')}` : null}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
          
          {/* Employee List Sidebar - Desktop only */}
          {!isMobile && (
            <div className="employee-list-sidebar border-r border-gray-200 overflow-hidden">
              <EmployeeList
                employees={availableEmployees}
                selectedEmployeeId={selectedEmployee ? `emp_${selectedEmployee.toLowerCase().replace(/\s+/g, '_')}` : null}
                onSelectEmployee={handleSelectEmployee}
                loading={feedbackLoading || chatLoading}
              />
            </div>
          )}
          
          {/* Chat Window */}
          <div className={`flex-1 overflow-hidden chat-window ${isMobile && !selectedEmployee ? 'mobile-hidden' : ''}`}>
            {selectedEmployee ? (
              <ChatWindow
                messages={messages}
                employeeName={selectedEmployee}
                onSendMessage={handleSendMessage}
                loading={isLoadingMessages}
                sendingMessage={sendingMessage}
                onBack={isMobile ? handleBackToList : undefined}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 text-center px-6 border border-gray-200">
                <svg
                  className="w-20 h-20 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Conversation
                </h2>
                <p className="text-sm text-gray-500 max-w-sm">
                  Choose an employee from the icons to start or continue a conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

