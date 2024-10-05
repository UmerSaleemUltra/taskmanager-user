import React, { useState } from 'react';
import { auth, db } from '../Config/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [names, setnames] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("User authenticated:", user); // Log user info
  
      // Save user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        names: names,
      });
  
      setSuccess("User registered successfully!");
      setEmail('');
      setPassword('');
      setnames ('')
  
      // Navigate to the login page after successful signup
      navigate('/login'); // Use appropriate navigation method
    } catch (err) {
      console.error("Error signing up:", err);
      setError(err.message); // Show error message
    }
  };
  
  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSignup}>
      <input
          type="text"
          value={names}
          onChange={(e) => setnames(e.target.value)}
          placeholder="name"
          required
        />
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
        <button type="submit">Sign Up</button>
      </form>

      <p>
        Don't have an account?{' '}
        <span onClick={() => navigate('/login')} className="navigate-signup">
          Signin here
        </span>
      </p>

      <style jsx>{`
        .signup-container {
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
           .navigate-signup {
          color: blue;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Signup;
