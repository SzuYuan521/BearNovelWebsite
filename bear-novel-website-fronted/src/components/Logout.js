import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/user-api";

// 登出頁面組件
const Logout = ({ onLogout }) => {
  const navigate = useNavigate(); // 用於頁面導航

  // 處理登出事件
  useEffect(() => {
    const handleLogout = async () => {
      console.log("handleLogout");
      try {
        await logout(); // 呼叫user-api/logout
        onLogout();
        navigate("/login"); // 登出後跳轉到登入頁面
      } catch (error) {
        console.error("Logout failed: " + (error.message || "未知錯誤"));
      }
    };
    handleLogout();
  }, [onLogout, navigate]);

  return (
    <div>
      <p>正在登出...</p>
    </div>
  );
};

export default Logout;
