import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import SessionContext from '../context/SessionContext';
import '../App.css';

const LeftSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // const [selectedSummary, setSelectedSummary] = useState(null);
  // const [selectedTranscript, setSelectedTranscript] = useState(null);
  // const [sessionList, setSessionList] = useState(sessions); // Add state for sessions

  const context = useContext(SessionContext);
  const {allSessions,setAllSessions,setSelectedSummary,setSelectedTranscript} = context;

  useEffect(() => {
    loadSessions();
  }, []);



  const handlePatientClick = (index) => {
    console.log(index)
    const session = allSessions[index];
    if (session) {
      setSelectedSummary(session.summary);
      setSelectedTranscript(session.transcript);
    }
  };

  const loadSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('sessions')) || [];
    const updatedSessions = savedSessions.map(session => ({
      ...session,
      read: session.read ?? true,
      deleted: session.deleted ?? false
    }));
    setAllSessions(updatedSessions);
  };

  const handleMarkUnread = (index) => {
    const updatedSessions = [...allSessions];
    updatedSessions[index] = { ...updatedSessions[index], read: false };
    setAllSessions(updatedSessions);
    localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    setShowMenu(false);
  };

  const handleDelete = (index) => {
    const updatedSessions = allSessions.filter((session, i) => i !== index);
    setAllSessions(updatedSessions);
    localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    setShowMenu(false);
  };

  const getFilteredSessions = () => {
    let filtered = allSessions;

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterType) {
      case 'unread':
        return filtered.filter(session => !session.read);
      case 'deleted':
        return filtered.filter(session => session.deleted);
      default:
        return filtered;
    }
  };

  const filteredSessions = getFilteredSessions();

  const getFilterCount = (type) => {
    switch (type) {
      case 'all':
        return allSessions.length;
      case 'unread':
        return allSessions.filter(session => !session.read).length;
      case 'deleted':
        return allSessions.filter(session => session.deleted).length;
      default:
        return 0;
    }
  };

  return (
    <div className="left-section">
      <div className="logo">
        <span className="logo-icon">🌐</span>
        <span className="company-name">Company</span>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search sessions by name"
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-dropdown">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="filter-button"
        >
          <div className="filter-button-content">
            {filterType === 'all' && <span className="filter-icon">🎙️</span>}
            {filterType === 'unread' && <span className="filter-icon">📝</span>}
            {filterType === 'deleted' && <span className="filter-icon">🗑️</span>}
            <span>
              {filterType === 'all' && `All sessions (${getFilterCount('all')})`}
              {filterType === 'unread' && `Unread sessions (${getFilterCount('unread')})`}
              {filterType === 'deleted' && `Deleted items (${getFilterCount('deleted')})`}
            </span>
          </div>
          <ChevronDown className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button
              onClick={() => {
                setFilterType('all');
                setIsDropdownOpen(false);
              }}
              className="dropdown-item"
            >
              <span className="filter-icon">🎙️</span>
              <span>All sessions ({getFilterCount('all')})</span>
            </button>
            <button
              onClick={() => {
                setFilterType('unread');
                setIsDropdownOpen(false);
              }}
              className="dropdown-item"
            >
              <span className="filter-icon">📝</span>
              <span>Unread sessions ({getFilterCount('unread')})</span>
            </button>
            <button
              onClick={() => {
                setFilterType('deleted');
                setIsDropdownOpen(false);
              }}
              className="dropdown-item"
            >
              <span className="filter-icon">🗑️</span>
              <span>Deleted items ({getFilterCount('deleted')})</span>
            </button>
          </div>
        )}
      </div>

      <div className="sessions">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, index) => (
            <div key={index} onClick={()=>handlePatientClick(index)} className="session-item">
              <div
                className="session-header flex justify-between items-center p-2"
                onMouseLeave={() => {
                  setShowMenu(false);
                }}
              >
                <div>
                  {/* Single session name with unread indicator */}
                  <h3
                    className="session-name cursor-pointer"
                    onClick={() => setSearchQuery(session.name)}
                    title="Click to search this patient"
                  >
                    {session.name}
                    {!session.read && <span className="ml-2 text-blue-500">•</span>}
                  </h3>
                  {session.pronouns && <span className="session-pronouns">({session.pronouns})</span>}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setShowMenu(true)}
                >
                  {/* More options (three vertical dots) */}
                  <button
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="More options"
                    onClick={() => {
                      setShowMenu(!showMenu);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown menu for options */}
                  {showMenu && (
                    <div
                      className="absolute right-0 top-8 w-48 py-2 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkUnread(index);
                        }}
                      >
                        Mark as unread
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(index);
                        }}
                      >
                        Delete Session
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Session info (timestamp and duration) */}
              <div className="session-info px-2 pb-2">
                <span className="session-timestamp mr-2">{session.timestamp}</span>
                <span className="session-duration">Duration: {session.duration}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-sessions">
            {searchQuery ? 'No matching sessions found' : 'No Recording Session yet'}
          </div>
        )}

      </div>
    </div>
  );
};

export default LeftSection;
