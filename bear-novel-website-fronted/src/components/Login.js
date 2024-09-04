import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user-api";
import "../css/auth.css";

// 登入頁面組件
function Login({ onLogin }) {
  // 定義狀態
  const [userNameOrEmail, setUserNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false); // 勾選框狀態
  const navigate = useNavigate();

  // 使用 useEffect 在 Login 組件加載時給 body 設置背景樣式
  useEffect(() => {
    // 給 body 添加自定義樣式(只有登入頁有的背景)
    document.body.classList.add("login-page-body");

    // 組件卸載時移除背景樣式
    return () => {
      document.body.classList.remove("login-page-body");
    };
  }, []);

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
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h2>會員登入</h2>
          <input
            type="text"
            className="auth-input mt-4 mb-3"
            placeholder="帳號/電子郵件"
            value={userNameOrEmail}
            onChange={(e) => setUserNameOrEmail(e.target.value)} // 更新用戶名或電子郵件
          />
          <input
            type="password"
            className="auth-input mt-3 mb-4"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 更新密碼
          />
          <div className="terms-container mt-4 mb-4">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)} // 更新勾選框狀態
            />
            <label htmlFor="terms-checkbox">
              我已閱讀並同意
              <a href="/terms" className="terms-link">
                會員服務條款
              </a>
              和
              <a href="/privacy-policy" className="terms-link">
                隱私權政策
              </a>
            </label>
          </div>
          <button
            className="btn btn-primary w-100"
            onClick={handleLogin}
            disabled={!isChecked}
          >
            登入
          </button>
          <p className="mt-3 text-danger">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
