import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import '../App.css';

const LeftSection = () => {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Load sessions when component mounts
    loadSessions();
    // window.addEventListener('sessionsUpdated', loadSessions);
    // return () => {
    //   window.removeEventListener('sessionsUpdated', loadSessions);
    // };
  }, []);

  const loadSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('sessions')) || [];
    // Ensure each session has a read and deleted property if not already present
    const updatedSessions = savedSessions.map(session => ({
      ...session,
      read: session.read ?? true,
      deleted: session.deleted ?? false
    }));
    setSessions(updatedSessions);
  };

  const handleMarkUnread = ({ session, index, updateSession, deleteSession }) => {
    console.log('Mark as unread clicked', { session, index });
    // updateSession(index, { ...session, read: false });
    setShowMenu(false);
  };

  const handleDelete = ({ session, index, updateSession, deleteSession }) => {
    console.log('Delete session clicked', { session, index });
    // deleteSession(index);
    setShowMenu(false);
  };

  // Filter sessions based on search query and filter type
  const getFilteredSessions = () => {
    let filtered = sessions;

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
        return sessions.length;
      case 'unread':
        return sessions.filter(session => !session.read).length;
      case 'deleted':
        return sessions.filter(session => session.deleted).length;
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
            <div key={index} className="session-item">
              <div className="session-header">
                <h3
                  className="session-name"
                  onClick={() => setSearchQuery(session.name)}
                  style={{ cursor: 'pointer' }}
                  title="Click to search this patient"
                >{session.name}</h3>
                {session.pronouns && <span className="session-pronouns">({session.pronouns})</span>}
              </div>
              <div className="session-info">
                <span className="session-timestamp">{session.timestamp}</span>
                <span className="session-duration">Duration: {session.duration}</span>
              </div>
              <div
                className="session-item relative group border"  // Added border for visibility
                onMouseLeave={() => {
                  console.log('Mouse left session item');
                  setShowMenu(false);
                }}
              >
                <div className="session-header flex justify-between items-center p-2">  {/* Changed to items-center */}
                  <div>
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
                    className="relative"  // Removed opacity classes
                    onMouseEnter={() => {
                      console.log('Mouse entered more options');
                      setShowMenu(true);
                    }}
                  >
                    <button
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="More options"
                      onClick={() => {
                        console.log('More options button clicked');
                        setShowMenu(!showMenu);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                      <div
                        className="absolute right-0 top-8 w-48 py-2 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                        onClick={(e) => {
                          console.log('Dropdown menu clicked');
                          e.stopPropagation();
                        }}
                      >
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkUnread();
                          }}
                        >
                          Mark as unread
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                          }}
                        >
                          Delete Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="session-info px-2 pb-2">
                  <span className="session-timestamp mr-2">{session.timestamp}</span>
                  <span className="session-duration">Duration: {session.duration}</span>
                </div>
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