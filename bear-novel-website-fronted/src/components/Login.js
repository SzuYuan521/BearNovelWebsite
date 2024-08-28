import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user-api";

// 登入頁面組件
function Login({ onLogin }) {
  // 定義狀態
  const [userNameOrEmail, setUserNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 處理登入事件
  const handleLogin = async () => {
    try {
      const response = await login(userNameOrEmail, password);
      setMessage(`登入成功! Token: ${response.token}`); // 設置成功消息
      onLogin(); // 登入成功後通知App.js
      navigate("/");
    } catch (error) {
      setMessage("登入失敗: " + (error.message || "未知錯誤"));
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="用戶名/電子郵件"
        value={userNameOrEmail}
        onChange={(e) => setUserNameOrEmail(e.target.value)} // 更新用戶名或電子郵件
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // 更新密碼
      />
      <button onClick={handleLogin}>登入</button>
      <p>{message}</p>
      <p>{userNameOrEmail}</p>
    </div>
  );
}

export default Login;
