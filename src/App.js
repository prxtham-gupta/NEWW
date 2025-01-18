import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './Dashboard';
import LeftSection from './components/LeftSection';
import RecordSession from './components/RecordSession';
import UploadSession from './components/UploadSession';

const App = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(()=>{
    const loggedInUser = sessionStorage.getItem("user");
    if(loggedInUser){
      setUser(loggedInUser);
      setIsLoggedIn(true);
    }
  },[])
  console.log(user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log(user);
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, fullName } = formData;
  
    if (isCreatingAccount) {
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
  
      const existingUser = localStorage.getItem(username);
      if (existingUser) {
        alert('Username already exists! Please use a different one.');
        return;
      }
  
      const userData = { username, password, fullName };
      localStorage.setItem(username, JSON.stringify(userData)); // Save to localStorage
      sessionStorage.setItem('user', JSON.stringify(userData)); // Save to sessionStorage
      alert('Account Created Successfully!');
      setIsCreatingAccount(false);
      navigate('/dashboard'); // Navigate to dashboard
    } else {
      const storedUser = localStorage.getItem(username);
      if (!storedUser) {
        alert('User does not exist. Please create an account.');
        return;
      }
  
      const { password: storedPassword, fullName: storedFullName } = JSON.parse(storedUser);
  
      if (storedPassword !== password) {
        alert('Incorrect password!');
        return;
      }
  
      const userData = { username, fullName: storedFullName };
      sessionStorage.setItem('user', JSON.stringify(userData)); // Save to sessionStorage only
      alert('Login Successful!');
      setUser(userData);
      setIsLoggedIn(true);
      navigate('/dashboard');
    }
  
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  console.log(isLoggedIn)

  const renderLoginForm = () => (
    <div className="login-box">
      <h2>{isCreatingAccount ? 'Create Account' : 'Login'}</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="input-container">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        {isCreatingAccount && (
          <>
            <div className="input-container">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-container">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}
        <button type="submit">
          {isCreatingAccount ? 'Create Account' : 'Login'}
        </button>
      </form>
      <p>
        {isCreatingAccount ? (
          <span>
            Already have an account?{' '}
            <button onClick={() => setIsCreatingAccount(false)}>Login here</button>
          </span>
        ) : (
          <span>
            Don't have an account?{' '}
            <button onClick={() => setIsCreatingAccount(true)}>Create one here</button>
          </span>
        )}
      </p>
    </div>
  );

  return (
    <div className="app-container">
      <div className={`left-section-wrapper ${isLoggedIn?"":"hidden"}`}>
        <LeftSection />
      </div>
      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={!isLoggedIn ? renderLoginForm() : null}
          />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} />}
          />
          {/* RecordSession component now handles both recording and uploading */}
          <Route
            path="/record-session"
            element={<RecordSession />}
          />
           <Route
            path="/upload-session"
            element={
              <UploadSession />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;