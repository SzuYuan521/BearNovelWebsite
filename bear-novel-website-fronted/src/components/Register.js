import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/user-api"; // 確保導入路徑正確
import "../css/auth.css";

// 註冊頁面組件
const Register = () => {
  // 定義狀態
  const [userName, setUserName] = useState("");
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false); // 勾選框狀態
  const [passwordVisible, setPasswordVisible] = useState(false); // 密碼顯示狀態
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 在 Register 組件加載時給 body 設置背景樣式
  useEffect(() => {
    // 給 body 添加背景樣式
    document.body.classList.add("register-page-body");

    // 組件卸載時移除背景樣式
    return () => {
      document.body.classList.remove("register-page-body");
    };
  }, []);

  // 處理註冊事件
  const handleRegister = async () => {
    if (!validateFields()) return;

    // 構建要發送的數據
    const userData = {
      UserName: userName,
      Email: email,
      Password: password,
      NickName: nickName,
    };

    try {
      await register(userData);
      setMessage("註冊成功！"); // 註冊成功訊息
      navigate("/success");
    } catch (error) {
      setMessage("註冊失敗: " + (error.message || "未知錯誤"));
    }
  };

  // 檢查每個欄位是否填寫
  const validateFields = () => {
    const newErrors = {};
    if (!userName) {
      newErrors.userName = "請輸入帳號";
    } else if (userName.length < 4 || userName.length > 20) {
      newErrors.userName = "帳號長度應為 4 到 20 字元";
    } else if (!/^[a-zA-Z0-9-_.]+$/.test(userName)) {
      newErrors.userName = "帳號只能包含英文字母、數字、-、_ 和 .";
    }
    if (!nickName) {
      newErrors.nickName = "請輸入暱稱";
    } else if (nickName.length > 20) {
      newErrors.nickName = "暱稱長度應為 10 字中文或 20 字英數字內";
    }
    if (!email) newErrors.email = "請輸入電子郵件";
    if (!password) {
      newErrors.password = "請輸入密碼";
    } else if (password.length < 6 || password.length > 20) {
      newErrors.password = "密碼長度應為 6 到 20 字元英數字";
    } else if (!/[a-z]/.test(password) || !/\d/.test(password)) {
      newErrors.password = "密碼必須包含至少一個小寫字母和一個數字";
    }
    if (!confirmPassword) newErrors.confirmPassword = "請確認密碼";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "密碼與確認密碼不一致";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-box">
          <h2>會員註冊</h2>
          <div className="input-container">
            <input
              type="text"
              className="auth-input mt-4"
              placeholder="帳號 4 ~ 20 字元"
              value={userName}
              minLength={4}
              maxLength={20}
              onChange={(e) => setUserName(e.target.value)} // 更新帳號
            />
            {errors.userName && (
              <span className="error-icon">⚠️ {errors.userName}</span>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              className="auth-input"
              placeholder="暱稱 10 字中文或 20 字英數字內"
              value={nickName}
              maxLength={20}
              onChange={(e) => setNickName(e.target.value)} // 更新暱稱
            />
            {errors.nickName && (
              <span className="error-icon">⚠️ {errors.nickName}</span>
            )}
          </div>
          <div className="input-container">
            <input
              type="email"
              className="auth-input"
              placeholder="電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 更新信箱
            />
            {errors.email && (
              <span className="error-icon">⚠️ {errors.email}</span>
            )}
          </div>
          <div className="input-container">
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"}
                className="auth-input"
                placeholder="密碼 6 ~ 20 字元"
                value={password}
                minLength={6}
                maxLength={20}
                onChange={(e) => setPassword(e.target.value)} // 更新密碼
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setPasswordVisible(!passwordVisible)} // 切換密碼顯示狀態
              >
                <i
                  className={`bi ${
                    passwordVisible ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>
            {errors.password && (
              <span className="error-icon">⚠️ {errors.password}</span>
            )}
          </div>
          <div className="input-container">
            <input
              type="password"
              className="auth-input"
              placeholder="確認密碼"
              value={confirmPassword}
              minLength={6}
              maxLength={20}
              onChange={(e) => setConfirmPassword(e.target.value)} // 更新確認密碼
            />
            {errors.confirmPassword && (
              <span className="error-icon">⚠️ {errors.confirmPassword}</span>
            )}
          </div>
          <div className="terms-container mb-4">
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
            onClick={handleRegister}
            disabled={!isChecked} // 未勾選條款時禁用註冊按鈕
          >
            註冊
          </button>
          <p className="registration-tip mt-4 text-center">
            已有帳號？
            <a href="/login" className="terms-link">
              立即登入
            </a>
          </p>
          <p className="mt-3 text-danger">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
