import React, { useState } from "react";
import { register } from "../api/user-api"; // 確保導入路徑正確

// 註冊頁面組件
const Register = () => {
  // 定義狀態
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState("");

  // 處理提交事件
  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止表單默認提交

    // 構建要發送的數據
    const userData = {
      UserName: userName,
      Email: email,
      Password: password,
      NickName: nickName,
    };

    try {
      console.log(userData);
      const response = await register(userData);
      console.log("註冊成功:", response); // 列印返回的 JSON
      alert("註冊成功!");
    } catch (err) {
      setError("註冊失敗，請檢查您的輸入。");
      console.error(
        "註冊失敗:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userName">帳號</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)} // 更新UserName
            required
          />
        </div>
        <div>
          <label htmlFor="email">電子信箱</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // 更新Email
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 更新密碼
            required
          />
        </div>
        <div>
          <label htmlFor="nickName">暱稱</label>
          <input
            type="text"
            id="nickName"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)} // 更新暱稱
          />
        </div>
        <button type="submit">註冊</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;
