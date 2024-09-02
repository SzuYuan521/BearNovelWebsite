// redux/slices/likeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toggleLikeNovel } from "../../api/novel-api";

// 非同步 action, 處理點讚 API 調用
export const toggleLike = createAsyncThunk(
  "likes/toggleLike", // action name
  async (novelId, { rejectWithValue }) => {
    //傳遞參數 novelId 給 action
    try {
      await toggleLikeNovel(novelId);
      return novelId; // 返回點讚的novelId
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const likeSlice = createSlice({
  name: "likes", // slice name
  initialState: {
    likedNovels: {}, // 初始狀態為empty obj, 未來以 novelId 為 key，是否點讚為 value
  },
  reducers: {
    // 同步 action, 設置某個小說的點讚狀態
    setLikeStatus: (state, action) => {
      const { novelId, isLiked } = action.payload;
      state.likedNovels[novelId] = isLiked;
    },
  },
  extraReducers: (builder) => {
    builder
      // toggleLike action(點讚)成功後, 更新Redux狀態
      .addCase(toggleLike.fulfilled, (state, action) => {
        const novelId = action.payload;
        state.likedNovels[novelId] = !state.likedNovels[novelId]; // 切換點讚狀態
      })
      // toggleLike action(點讚)失敗後, 記錄錯誤訊息
      .addCase(toggleLike.rejected, (state, action) => {
        console.error("點讚錯誤: ", action.payload);
      });
  },
});

// 導出 setLikeStatus action，以便在組件中使用
export const { setLikeStatus } = likeSlice.actions;

// 導出 reducer，以便在 store 中使用
export default likeSlice.reducer;
