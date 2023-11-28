import React from "react"
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"

import ClosedBeta from "./ClosedBeta"
import Dashboard from "./Dashboard";
import Login from "./Login";
import { AuthProvider, useAuth } from './Context/authContext';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? <Navigate to="/closed-beta" replace /> : element;
};

const App = () => {
  
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route
              path="/login"
              element={<PublicRoute element={<Login />} />}
            />
            {/*<Route path="/open-beta" element={<OpenBeta/>}/>*/}
            <Route
              path="/closed-beta"
              element={<PrivateRoute element={<ClosedBeta />} />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}


export default App
