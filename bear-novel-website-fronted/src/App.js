import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/NavbarComponent";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SuccessPage from "./components/SuccessPage";
import Logout from "./components/Logout"; // 引入 Logout 組件
import Agreement from "./components/Agreement";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { getUserInfo } from "./api/user-api";

function App() {
  // 定義 isLoggedIn 狀態, 追蹤使用者是否已登入
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 定義 user 狀態, 用於儲存使用者資訊
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // UserData處理
        const userData = await getUserInfo();
        setUser(userData);
        console.log("User object:", userData);

        // 設置為登入狀態, 方便UI處理
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkLoginStatus(); // 檢查使用者狀態
  }, []); // 確保此 effect 只在組件首次掛載時執行一次

  // 登入後狀態更新
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

  // 登出後狀態更新
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
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
          <Route path="/terms" element={<Agreement />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
