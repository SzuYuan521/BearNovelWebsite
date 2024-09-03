import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNovels,
  getNovelsByUser,
  getNovelsByNickName,
  getNovelsByTitleKeyWords,
} from "../../api/novel-api";
import { setLikeStatus } from "./likeSlice";

// 取得小說列表(異步)
export const getNovelList = createAsyncThunk(
  "novels/getNovels",
  async (_, { dispatch }) => {
    const response = await getNovels();

    // 初始化小說的點讚狀態
    response.forEach((novel) => {
      dispatch(
        setLikeStatus({ novelId: novel.novelId, isLiked: novel.isLiked })
      );
    });

    return response;
  }
);

// 用於管理小說列表狀態
const novelSlice = createSlice({
  name: "novels",
  initialState: {
    list: [], // 儲存小說資料
    status: "idle", // 加載狀態：'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    updateLikeStatus: (state, action) => {
      const { novelId, isLiked, likeCount } = action.payload;
      const novel = state.list.find((novel) => novel.novelId === novelId);
      if (novel) {
        novel.isLiked = isLiked;
        novel.likeCount = likeCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNovelList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNovelList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(getNovelList.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { updateLikeStatus } = novelSlice.actions;
export default novelSlice.reducer;
