import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNovels,
  getNovelsByUserId,
  getMyNovels,
  getNovelsByNickName,
  getNovelsByTitleKeyWords,
  createNovel,
} from "../../api/novel-api";
import { setLikeStatus, setLikeCount } from "./likeSlice";

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
      dispatch(
        setLikeCount({
          novelId: novel.novelId,
          likeCount: novel.likeCount,
        })
      );
    });

    return response;
  }
);

// 根據 userId 取得小說
export const getNovelListByUser = createAsyncThunk(
  "novels/getNovelListByUser",
  async (userId, { dispatch }) => {
    const response = await getNovelsByUserId(userId);

    response.forEach((novel) => {
      dispatch(
        setLikeStatus({ novelId: novel.novelId, isLiked: novel.isLiked })
      );
      dispatch(
        setLikeCount({
          novelId: novel.novelId,
          likeCount: novel.likeCount,
        })
      );
    });

    return response;
  }
);

// 取得用戶自己的小說
export const getMyNovelList = createAsyncThunk(
  "novels/getMyNovelList",
  async (_, { dispatch }) => {
    const response = await getMyNovels();

    response.forEach((novel) => {
      dispatch(
        setLikeStatus({ novelId: novel.novelId, isLiked: novel.isLiked })
      );
      dispatch(
        setLikeCount({
          novelId: novel.novelId,
          likeCount: novel.likeCount,
        })
      );
    });

    return response;
  }
);

// 根據 暱稱 取得小說
export const getNovelListByNickName = createAsyncThunk(
  "novels/getNovelListByNickName",
  async (nickName, { dispatch }) => {
    const response = await getNovelsByNickName(nickName);

    response.forEach((novel) => {
      dispatch(
        setLikeStatus({ novelId: novel.novelId, isLiked: novel.isLiked })
      );
      dispatch(
        setLikeCount({
          novelId: novel.novelId,
          likeCount: novel.likeCount,
        })
      );
    });

    return response;
  }
);

// 關鍵字取得小說
export const getNovelListByKeyWords = createAsyncThunk(
  "novels/getNovelListByKeyWords",
  async (keywords, { dispatch }) => {
    const response = await getNovelsByTitleKeyWords(keywords);

    response.forEach((novel) => {
      dispatch(
        setLikeStatus({ novelId: novel.novelId, isLiked: novel.isLiked })
      );
      dispatch(
        setLikeCount({
          novelId: novel.novelId,
          likeCount: novel.likeCount,
        })
      );
    });

    return response;
  }
);

export const addNovel = createAsyncThunk(
  "novels/addNovel",
  async (novel, { rejectWithValue }) => {
    try {
      const response = await createNovel(novel);
      return response; // 返回成功的響應
    } catch (error) {
      return rejectWithValue(error.response.data); // 返回錯誤信息
    }
  }
);

// 用於管理小說列表狀態
const novelSlice = createSlice({
  name: "novels",
  initialState: {
    list: [], // 儲存小說資料
    status: "idle", // 通用加載狀態: 'idle' | 'loading' | 'succeeded' | 'failed'
    userNovelsStatus: "idle", // 根據 userId 取得小說的狀態
    myNovelsStatus: "idle", // 我的小說的加載狀態
    nickNameNovelsStatus: "idle", // 根據暱稱取得小說的狀態
    keyWordsNovelsStatus: "idle", // 關鍵字取得小說的狀態
    addNovelStatus: "idle", // 新增小說的狀態
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
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
      })
      .addCase(getNovelList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(getNovelList.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getNovelListByUser.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "loading";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
      })
      .addCase(getNovelListByUser.fulfilled, (state, action) => {
        state.userNovelsStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(getNovelListByUser.rejected, (state) => {
        state.userNovelsStatus = "failed";
      })
      .addCase(getMyNovelList.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "loading";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
      })
      .addCase(getMyNovelList.fulfilled, (state, action) => {
        state.myNovelsStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(getMyNovelList.rejected, (state) => {
        state.myNovelsStatus = "failed";
      })
      .addCase(getNovelListByNickName.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "loading";
        state.keyWordsNovelsStatus = "idle";
      })
      .addCase(getNovelListByNickName.fulfilled, (state, action) => {
        state.nickNameNovelsStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(getNovelListByNickName.rejected, (state) => {
        state.nickNameNovelsStatus = "failed";
      })
      .addCase(getNovelListByKeyWords.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "loading";
      })
      .addCase(getNovelListByKeyWords.fulfilled, (state, action) => {
        state.keyWordsNovelsStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(getNovelListByKeyWords.rejected, (state) => {
        state.keyWordsNovelsStatus = "failed";
      })
      .addCase(addNovel.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
        state.addNovelStatus = "loading";
      })
      .addCase(addNovel.fulfilled, (state, action) => {
        state.addNovelStatus = "succeeded";
        state.list.push(action.payload); // 將新小說添加到列表中
      })
      .addCase(addNovel.rejected, (state, action) => {
        state.addNovelStatus = "failed";
        console.error("Failed to add novel:", action.payload);
      });
  },
});

export const { updateLikeStatus } = novelSlice.actions;
export default novelSlice.reducer;
