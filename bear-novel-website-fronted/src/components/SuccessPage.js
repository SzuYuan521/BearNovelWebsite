import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/auth.css";

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 5秒後自動跳轉到登入頁面
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    // 清除計時器
    return () => clearTimeout(timer);
  }, [navigate]);

  // 處理立即跳轉
  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="success-page">
      <h1>註冊成功</h1>
      <p>您已成功註冊，5 秒後將自動跳轉至登入頁面。</p>
      <button onClick={handleRedirect} className="btn btn-primary">
        立即跳轉
      </button>
    </div>
  );
};

export default SuccessPage;
