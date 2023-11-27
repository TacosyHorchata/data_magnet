import React from "react"
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"

import OpenBeta from "./OpenBeta"
import Dashboard from "./Dashboard";

const App = () => {
  
  return (
    <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/open-beta" element={<OpenBeta/>}/>
          </Routes>
        </div>
    </Router>
  );
}


export default App
