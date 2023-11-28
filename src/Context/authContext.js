import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Retrieve user information from localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Check expiration time
      if (parsedUser && parsedUser.expiration && Date.now() < parsedUser.expiration) {
        return parsedUser;
      } else {
        localStorage.removeItem('user'); // Clear expired user data
      }
    }
    return null;
  });

  useEffect(() => {
    // Update localStorage whenever the user changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData) => {
    // Set expiration to 7 days from now
    const expiration = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    setUser({ ...userData, expiration });
  };

  const logout = () => {
    // Logic for handling user logout
    setUser(null);
  };

  const isAuthenticated = () => {
    // Check if the user is authenticated (modify this as per your authentication logic)
    return !!user && Date.now() < user.expiration;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
