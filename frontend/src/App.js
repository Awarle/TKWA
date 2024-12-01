import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadDocument from './pages/UploadDocument';
import PrinterDashboard from './pages/PrinterDashboard';
import Map from './components/Map';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




function App() {
  
  return (
    <Router>
      <Navbar />
      
      

    <div>
    <Routes>

    <Route path="/" element={<Home />} />  

<Route path="/map" element={<Map />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/upload-document" element={<UploadDocument />} />
<Route path="/printer-dashboard" element={<PrinterDashboard />} />
<Route path="/change-password" element={<ChangePassword />} />
<Route path="/forgot-password" element={<ForgotPassword />} />


</Routes>

    </div>      

    
      
    </Router>
  );
}

export default App;
