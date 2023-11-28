import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
   } from "firebase/auth";
import {auth} from "./firebase.js";
import { useAuth } from './Context/authContext';
import { useNavigate } from 'react-router-dom'; 
import './Login.css'; // Import the CSS file
import logo_bn from './images/logo-lookup-data-magnet-blanco.svg' 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Assuming res.user contains the user data upon successful login
      // Update the user data in the AuthProvider
      if (res && res.user) {
        const userData = {
          uid: res.user.uid,
          // Other user data you want to store
        };
        // Pass the user data to the login function in AuthProvider
        login(userData);
        navigate('/closed-beta');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
    <img onClick={()=>navigate('/')} style={{margin:"2vw 0 0 3vw", width:"250px"}} src={logo_bn} class='brand'/>
    <div className='Login'>
        <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <div className="form-group">
            <label>Email:</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>
            <div className="form-group">
            <label>Password:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>
            <button type="submit" className="btn-login">Login</button>
            {error && <p className="error-message">{error}</p>}
        </form>
        </div>
    </div>
    </>
  );
};

export default Login;
