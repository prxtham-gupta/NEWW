import React, { useState, useRef, useEffect } from 'react';
import './ProfileDropdown.css';
import ProfileModal from './ProfileModal';
import SessionPreferencesModal from './SessionPreferencesModal';
import MedicalDictionaryModal from './MedicalDictionaryModal';
import { Navigate } from 'react-router-dom';

const ProfileDropdown = ({ user, onProfileUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  const handleMenuItemClick = (action) => {
    switch (action) {
      case 'profile':
        setShowProfileModal(true);
        break;
      case 'dictionary':
        // Handle medical dictionary click
        setShowDictionaryModal(true);
        break;
      case 'preferences':
        setShowPreferencesModal(true);
        break;
      case 'logout':
        // Handle logout click
        break;
      default:
        break;
    }
    setIsOpen(false);
  };


  return (
    <div className="profile-container" ref={dropdownRef}>
      <div className="profile" onClick={() => setIsOpen(!isOpen)}>
        <div className="initials">{getInitials(user?.fullName || 'User')}</div>
        <div className="full-name">{user?.fullName}</div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="menu-item" onClick={() => handleMenuItemClick('profile')}>
            <div className="menu-icon profile-icon">👤</div>
            <span>My Profile</span>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('dictionary')}>
            <div className="menu-icon dictionary-icon">📚</div>
            <span>Medical Dictionary</span>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('preferences')}>
            <div className="menu-icon preferences-icon">🎤</div>
            <span>Session Preferences</span>
          </div>
          <div className="menu-item logout" onClick={() => handleMenuItemClick('logout')}>
            <div className="menu-icon logout-icon">↪️</div>
            <span>Logout</span>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSave={(data) => {
          onProfileUpdate(data);
          setShowProfileModal(false);
        }}
      />

      <SessionPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={(preferencesData) => {
          setShowPreferencesModal(false);
        }}
      />

      <MedicalDictionaryModal
        isOpen={showDictionaryModal}
        onClose={() => setShowDictionaryModal(false)}
      />
    </div>
  );
};

export default ProfileDropdown;