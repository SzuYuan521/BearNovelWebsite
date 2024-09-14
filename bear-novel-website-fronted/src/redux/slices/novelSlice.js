import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNovels,
  getNovelsByUserId,
  getMyNovels,
  getNovelsByNickName,
  getNovelsByTitleKeyWords,
  createNovel,
  createChapter,
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

export const addChapter = createAsyncThunk(
  "novels/addChapter",
  async ({ id, chapter }, { rejectWithValue }) => {
    try {
      const response = await createChapter(id, chapter);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const filterAndSortNovels = (list, novelType, sortOrder) => {
  // 若 novelType 為 "All" 或者未指定, 則不進行篩選
  let filteredList =
    novelType === undefined || novelType === null || novelType === -1
      ? list
      : list.filter(
          (novel) => novel.novelTypes && novel.novelTypes.includes(novelType)
        );

  // 將篩選後的列表進行排序
  return sortNovelsList(filteredList, sortOrder);
};

const sortNovelsList = (list, sortOrder) => {
  return list.slice().sort((a, b) => {
    switch (sortOrder) {
      case "latest": // 按照 createdAt 從最新到舊排序
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "popular": // 按照 likeCount 從大到小排序
        return b.likeCount - a.likeCount;
      default:
        return 0;
    }
  });
};

// 用於管理小說列表狀態
const novelSlice = createSlice({
  name: "novels",
  initialState: {
    originalList: [], // 保存原始的完整小說列表
    displayList: [], // 用於顯示的已篩選和排序的小說列表
    status: "idle", // 通用加載狀態: 'idle' | 'loading' | 'succeeded' | 'failed'
    userNovelsStatus: "idle", // 根據 userId 取得小說的狀態
    myNovelsStatus: "idle", // 我的小說的加載狀態
    nickNameNovelsStatus: "idle", // 根據暱稱取得小說的狀態
    keyWordsNovelsStatus: "idle", // 關鍵字取得小說的狀態
    addNovelStatus: "idle", // 新增小說的狀態
    addChapterStatus: "idle", // 新增小說的狀態
    sortOrder: "latest", // 預設排序順序 最新
    novelType: -1, // 預設分類為 -1(All), 首頁也是 -1(All)
  },
  reducers: {
    updateLikeStatus: (state, action) => {
      const { novelId, isLiked, likeCount } = action.payload;
      const novel = state.originalList.find(
        (novel) => novel.novelId === novelId
      );
      if (novel) {
        novel.isLiked = isLiked;
        novel.likeCount = likeCount;
      }
    },
    resetNovelState: (state) => {
      state.status = "idle";
      state.userNovelsStatus = "idle";
      state.myNovelsStatus = "idle";
      state.nickNameNovelsStatus = "idle";
      state.keyWordsNovelsStatus = "idle";
      state.addNovelStatus = "idle";
      state.addChapterStatus = "idle";
    },
    sortNovels: (state, action) => {
      const { sortOrder, novelType } = action.payload;
      state.sortOrder = sortOrder !== undefined ? sortOrder : state.sortOrder; // 更新排序
      state.novelType = novelType !== undefined ? novelType : state.novelType; // 更新類型
      state.displayList = filterAndSortNovels(
        state.originalList,
        state.novelType,
        state.sortOrder
      );
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
        state.originalList = action.payload; // 保存原始列表
        state.displayList = filterAndSortNovels(
          action.payload,
          state.novelType,
          state.sortOrder
        );
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
        state.originalList = action.payload;
        state.displayList = state.originalList;
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
        state.originalList = action.payload;
        state.displayList = state.originalList;
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
        state.originalList = action.payload;
        state.displayList = state.originalList;
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
        state.originalList = action.payload;
        state.displayList = state.originalList;
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
        state.originalList.push(action.payload); // 將新小說添加到列表中
        state.displayList = state.originalList;
      })
      .addCase(addNovel.rejected, (state, action) => {
        state.addNovelStatus = "failed";
        console.error("Failed to add novel:", action.payload);
      })
      .addCase(addChapter.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
        state.addChapterStatus = "loading";
      })
      .addCase(addChapter.fulfilled, (state, action) => {
        state.addChapterStatus = "succeeded";
        state.originalList.push(action.payload); // 將新章節添加到列表中
        state.displayList = state.originalList;
      })
      .addCase(addChapter.rejected, (state, action) => {
        state.addChapterStatus = "failed";
        console.error(
          "Failed to add chapter:",
          action.payload || action.error.message
        );
      });
  },
});

export const { updateLikeStatus, resetNovelState, sortNovels } =
  novelSlice.actions;

export const selectDisplayList = (state) => state.novels.displayList;
export const selectOriginalList = (state) => state.novels.originalList;

export default novelSlice.reducer;
