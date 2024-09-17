import axios from "axios";
import axiosInstance from "./api";

// 定義 Novel API 的基礎 URL
const API_URL = "http://localhost:5052/api/novels";
const NOVEL_URL = "/novels";

// 取得所有小說
export const getNovels = async () => {
  console.log("getNovels");
  try {
    const response = await axiosInstance.get(NOVEL_URL);
    return response.data;
  } catch (error) {
    console.error("獲取所有小說失敗: ", error);
    throw error;
  }
};

// 根據 NovelId 取得小說(包含小說/作者/章節資料)
export const getNovelById = async (novelId) => {
  try {
    const response = await axios.get(`${API_URL}/${novelId}`, {
      timeout: 30000, // 設置 10 秒超時
      maxContentLength: Infinity, // 允許任意大小的響應
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching novel:", error);
    if (error.response) {
      // 服務器回應了請求，但狀態碼不在 2xx 範圍內
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // 請求已發送，但沒有收到回應
      console.error("No response received:", error.request);
    } else {
      // 設置請求時出現問題
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw error;
  }
};

// 根據 UserId 取得該用戶的所有小說
export const getNovelsByUserId = async (userId) => {
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

// 取得該登入用戶的所有小說
export const getMyNovels = async () => {
  try {
    const response = await axiosInstance.get(`${NOVEL_URL}/my-novels`);
    return response.data;
  } catch (error) {
    console.error("獲取自己的小說失敗: ", error);
    throw error;
  }
};

// 根據暱稱(作者名)取得該用戶的所有小說
export const getNovelsByNickName = async (nickName) => {
  try {
    const response = await axios.get(`${API_URL}/authorName/${nickName}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("根據作者名搜尋小說失敗", error);
    throw error;
  }
};

// 根據關鍵字搜尋小說
export const getNovelsByTitleKeyWords = async (keywords) => {
  try {
    const response = await axios.get(`${API_URL}/keywords/${keywords}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("根據關鍵字搜尋小說失敗", error);
    throw error;
  }
};

// 創建新小說
export const createNovel = async (novel) => {
  try {
    const response = await axiosInstance.post(`${NOVEL_URL}/`, {
      NovelTitle: novel.Title,
      NovelTypes: novel.NovelTypes,
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
    const response = await axios.put(
      `${API_URL}/${id}`,
      {
        NovelId: id,
        NovelTitle: updatedNovel.Title,
        NovelDescription: updatedNovel.Description,
        IsEnding: updatedNovel.IsEnding,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("更新小說失敗: ", error);
    throw error;
  }
};

// 刪除小說
export const deleteNovel = async (id) => {
  try {
    await axiosInstance.delete(`${NOVEL_URL}/${id}`, {});
  } catch (error) {
    console.error("刪除小說失敗: ", error);
    throw error;
  }
};

// 檢查是否是小說作者
export const checkAuthor = async (id) => {
  try {
    const response = await axiosInstance.get(`${NOVEL_URL}/${id}/check-author`);
    return response.data;
  } catch (error) {
    console.error("你不是作者: ", error);
    throw error;
  }
};

// 點讚或取消點讚
export const toggleLikeNovel = async (id) => {
  try {
    const response = await axiosInstance.post(`${NOVEL_URL}/${id}/like`, {});
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

// 新增章節
export const createChapter = async (id, chapter) => {
  try {
    const response = await axiosInstance.post(
      `${NOVEL_URL}/${id}/chapters`,
      JSON.stringify(chapter.Title),
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 設置超時時間為 10 秒
      }
    );
    return response.data;
  } catch (error) {
    console.log("新增章節失敗:", error);
    if (error.response) {
      console.log("錯誤響應:", error.response.data);
      console.log("錯誤狀態:", error.response.status);
    } else if (error.request) {
      console.log("請求錯誤:", error.request);
    } else {
      console.log("錯誤:", error.message);
    }
    throw error;
  }
};

// 編輯章節
export const updateChapter = async (id, chapter) => {
  try {
    await axiosInstance.put(`${NOVEL_URL}/chapter/${id}`, {
      ChapterTitle: chapter.title,
      ChapterContent: chapter.content,
    });
  } catch (error) {
    console.log("更新章節失敗");
    throw error;
  }
};

// 刪除章節
export const deleteChapter = async (id) => {
  try {
    await axios.delete(
      `${API_URL}/chapter/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log("刪除章節失敗");
    throw error;
  }
};

// 取得章節(chapterId)
export const getChapter = async (id) => {
  try {
    await axios.get(`${API_URL}/chapter/${id}`);
  } catch (error) {
    console.log("取得章節失敗");
    throw error;
  }
};

// 取得某小說的所有章節(novelId)
export const getAllChapters = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/all-chapters`);
    return response.data;
  } catch (error) {
    console.log("取得章節失敗");
    throw error;
  }
};

export const GetChapterList = async (novelId, page) => {
  try {
    const response = await axios.get(
      `${API_URL}/${novelId}/chapterlist?page=${page}&pageSize=10`
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log("取得章節失敗");
    throw error;
  }
};

export const GetChapterContext = async (novelId, chapterId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${novelId}/chapters/${chapterId}`
    );
    return response.data;
  } catch (error) {
    console.log("取得章節內容");
    throw error;
  }
};
