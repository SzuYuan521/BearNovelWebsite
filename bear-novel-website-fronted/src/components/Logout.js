import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/user-api";

// 登出頁面組件
function Logout() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // 用於頁面導航

  // 處理登出事件
  const handleLogout = async () => {
    try {
      await logout(); // 呼叫user-api/logout
      setMessage("登出成功!");
      navigate("/login"); // 登出後跳轉到登入頁面
    } catch (error) {
      setMessage("Logout failed: " + (error.message || "未知錯誤"));
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>登出</button>
      <p>{message}</p>
    </div>
  );
}

export default Logout;
