import React from "react"
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"

import ErrorBoundary from "./ErrorBoundary";

import OpenBeta from "./OpenBeta"
import Dashboard from "./Dashboard";

const App = () => {
  
  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/open-beta" element={<OpenBeta/>}/>
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}


export default App
