import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    if (isCreatingAccount) {
      const userExists = storedUsers.some((user) => user.username === username);
      if (userExists) {
        setError('Username already exists');
        return;
      }

      
      const newUser = { username, password, fullName };
      localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));  // Save users to localStorage
      onLogin(newUser);
    } else {
      // Login logic
      const user = storedUsers.find((user) => user.username === username && user.password === password);
      if (user) {
        onLogin(user);  // Successful login
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>{isCreatingAccount ? 'Create Account' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isCreatingAccount && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isCreatingAccount ? 'Create Account' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        {isCreatingAccount ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => setIsCreatingAccount(!isCreatingAccount)}>
          {isCreatingAccount ? 'Login' : 'Create Account'}
        </button>
      </p>
    </div>
  );
};

export default Login;
