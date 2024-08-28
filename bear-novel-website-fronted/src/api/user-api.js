import axios from "axios";

// 定義 User API 的基礎 URL
const API_URL = "http://localhost:5052/api/users";

// 註冊函數
export async function register(userData) {
  try {
    // 發送 POST 請求進行註冊
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json", // 設置請求標頭為 JSON 格式
      },
    });
    return response.data; // 返回後端響應的數據
  } catch (error) {
    console.error(
      "註冊失敗:",
      error.response ? error.response.data : error.message // 記錄錯誤信息
    );
    throw error;
  }
}

// 登入函數
export const login = async (userNameOrEmail, password) => {
  try {
    // 發送 POST 請求進行登入
    const response = await axios.post(`${API_URL}/login`, {
      UserNameOrEmail: userNameOrEmail,
      Password: password,
    });
    // 登入成功後 服務器會設置一個包含用戶ID的 cookie
    // 不需要在客戶端存儲 token
    return response.data; // 返回後端響應的數據
  } catch (error) {
    console.error("登入失敗:", error); // 記錄錯誤信息
    throw error.response ? error.response.data : new Error("網路錯誤");
  }
};

// 登出函數
export const logout = async () => {
  try {
    // 發送 POST 請求進行登出
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        withCredentials: true, // 確保發送包含身份驗證信息的 cookies
      }
    );

    // 清理前端的任何相關狀態（如果有的話）
    // 例如，如果在前端存儲了用戶信息，可以在這裡清除
    // 但不使用 localStorage

    console.log("登出成功");
    return response.data; // 返回後端的響應數據
  } catch (error) {
    console.error("登出失敗:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};
