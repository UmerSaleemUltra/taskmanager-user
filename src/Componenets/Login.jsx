import React, { useState } from 'react';
import { auth } from '../Config/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate(); // Move useNavigate to the top level

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccess("User logged in successfully!");
      setEmail('');
      setPassword('');
      navigate('/tasks'); // Navigate after login
    } catch (err) {
      console.error("Error logging in:", err);
      setError(err.message); // Show error message
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 50px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
        }
        h2 {
          color: #333;
          text-align: center;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        input {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #45a049;
        }
        .error {
          color: red;
          text-align: center;
        }
        .success {
          color: green;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Login;
