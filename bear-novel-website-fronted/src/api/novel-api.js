import axios from "axios";

// 定義 Novel API 的基礎 URL
const API_URL = "http://localhost:5052/api/novels";

// 取得所有小說
export const getNovels = async () => {
  try {
    const response = await axios.get(`${API_URL}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("獲取所有小說失敗: ", error);
    throw error;
  }
};

// 根據 UserId 取得該用戶的所有小說
export const getNovelsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("根據UserId獲取小說失敗: ", error);
    throw error;
  }
};

// 創建新小說
export const createNovel = async (novel) => {
  try {
    const response = await axios.post(`${API_URL}/`, novel, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating novel:", error);
    throw error;
  }
};

// 更新小說
export const updateNovel = async (id, updatedNovel) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updateNovel, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("更新小說失敗: ", error);
    throw error;
  }
};

// 刪除小說
export const deleteNovel = async (id) => {
  try {
    await axios.delete(
      `${API_URL}/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("刪除小說失敗: ", error);
    throw error;
  }
};

// 點讚或取消點讚
export const toggleLikeNovel = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/like`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("點讚小說失敗: ", error);
    throw error;
  }
};

// 記錄觀看
export const recordView = async (id) => {
  try {
    await axios.post(
      `${API_URL}/${id}/view`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("記錄觀看失敗: ", error);
    throw error;
  }
};
