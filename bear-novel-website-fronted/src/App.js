import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/NavbarComponent";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Logout from "./components/Logout"; // 引入 Logout 組件
import { getUserInfo } from "./api/user-api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
        console.log("User object:", userData);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      const userData = await getUserInfo();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <NavbarComponent
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        user={user}
      />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
