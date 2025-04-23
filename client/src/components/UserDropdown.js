import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  if (!user) return null;
  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <span className="avatar-placeholder avatar-initial" onClick={() => setOpen(!open)} style={{cursor:'pointer'}}>
        {user.username?.charAt(0).toUpperCase() || 'U'}
      </span>
      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-header">Signed in as <b>{user.username}</b></div>
          <button className="dropdown-item" onClick={() => {navigate('/profile'); setOpen(false);}}>Profile</button>
          <button className="dropdown-item" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
