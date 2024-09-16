import axios from "axios";

const API_URL = "http://localhost:5052/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/// 需要認證的 API 列表
const authRequiredPaths = [
  "/users/user",
  "/novels/", // 創建、更新、刪除小說
  "/novels/my-novels",
  "/novels//like", // 點讚或取消點讚
  "/novels//check-author", // 檢查是不是該小說作者
  "/novels/chapter/",
  "/novels//chapters",
];

/// 可選認證的 API 列表(即使登出也會繼續呼叫 API)
const optionalAuthPaths = ["/novels"];

/// 檢查是否需要認證
const isAuthRequired = (url) => {
  return authRequiredPaths.some((path) => {
    if (path.endsWith("/")) {
      // 對於以 '/' 結尾的路徑, 檢查 URL 是否以該路徑開始
      return url.startsWith(path);
    } else {
      // 對於其他路徑, 使用完全匹配
      return url === path || url.startsWith(path + "/");
    }
  });
};

/// 檢查是否為可選認證
const isOptionalAuth = (url) => {
  return optionalAuthPaths.some((path) => url.includes(path));
};

// 請求攔截器
axiosInstance.interceptors.request.use(
  async (config) => {
    // 如果是需要認證的 API 或可選認證的 API, 嘗試刷新 token
    if (isAuthRequired(config.url) || isOptionalAuth(config.url)) {
      try {
        await axiosInstance.post("/users/refresh-token", {}, { timeout: 5000 });
      } catch (error) {
        console.warn("Token 刷新失敗");
        // 對於可選認證的 API, 即使刷新失敗也繼續請求
        if (isOptionalAuth(config.url)) {
          console.log("繼續發送請求，可能以未登錄狀態訪問");
        } else if (isAuthRequired(config.url)) {
          return Promise.reject(error); // 對於必須認證的 API，中止請求
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 錯誤且不是刷新 token 的請求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 對於可選認證的 API, 即使收到 401 也會繼續請求
      if (isOptionalAuth(originalRequest.url)) {
        console.log("以未登錄狀態重試請求");
        return axiosInstance(originalRequest);
      }

      // 對於必須認證的 API, 嘗試刷新 token
      if (isAuthRequired(originalRequest.url)) {
        try {
          await axiosInstance.post("/users/refresh-token");
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token 刷新失敗，可能需要重新登錄");
          // 這裡之後再添加觸發重新登錄流程
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
