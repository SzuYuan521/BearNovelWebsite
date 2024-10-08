import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNovels,
  getNovelById,
  getNovelsByUserId,
  getMyNovels,
  getNovelsByNickName,
  getNovelsByTitleKeyWords,
  createNovel,
  createChapter,
  deleteNovel,
  deleteChapter,
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

export const getNovelByNovelId = createAsyncThunk(
  "novels/getNovelByNovelId",
  async (novelId, { dispatch }) => {
    const response = await getNovelById(novelId);
    dispatch(
      setLikeStatus({ novelId: response.novelId, isLiked: response.isLiked })
    );
    dispatch(
      setLikeCount({ novelId: response.novelId, likeCount: response.likeCount })
    );

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

export const delNovel = createAsyncThunk(
  "novels/delNovel",
  async (novelId, { rejectWithValue }) => {
    try {
      await deleteNovel(novelId);
      return novelId;
    } catch (error) {
      return rejectWithValue(error);
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
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const delChapter = createAsyncThunk(
  "novels/delChapter",
  async ({ chapterId }, { rejectWithValue }) => {
    console.log(chapterId);
    try {
      await deleteChapter(chapterId);
      return chapterId;
    } catch (error) {
      return rejectWithValue(error.message);
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

export const novelTypeArray = [
  { label: "全部", value: -1 }, // All
  { label: "戀愛言情", value: 0 }, // Romance
  { label: "古代", value: 1 }, // Ancient
  { label: "末日", value: 2 }, // Doomsday
  { label: "科幻", value: 3 }, // ScienceFiction
  { label: "校園", value: 4 }, // Campus
  { label: "武俠修仙", value: 5 }, // MartialArts
  { label: "系統", value: 6 }, // System
  { label: "豪門", value: 7 }, // RichFamily
  { label: "穿越", value: 8 }, // TimeTravel
  { label: "重生", value: 9 }, // Rebirth
  { label: "懸疑", value: 10 }, // Suspense
  { label: "靈異", value: 11 }, // Supernatural
  { label: "架空", value: 12 }, // Imaginary
  { label: "搞笑", value: 13 }, // Funny
  { label: "網遊競技", value: 14 }, // OnlineGames
  { label: "男同性戀", value: 15 }, // BL
  { label: "女同性戀", value: 16 }, // Lesbian
  { label: "萌寶", value: 17 }, // CuteBaby
];

// 用於管理小說列表狀態
const novelSlice = createSlice({
  name: "novels",
  initialState: {
    originalList: [], // 保存原始的完整小說列表
    displayList: [], // 用於顯示的已篩選和排序的小說列表
    currentNovel: null, // 當前查看的小說
    currentNovelChapters: [],
    status: "idle", // 通用加載狀態: 'idle' | 'loading' | 'succeeded' | 'failed'
    userNovelsStatus: "idle", // 根據 userId 取得小說的狀態
    myNovelsStatus: "idle", // 我的小說的加載狀態
    nickNameNovelsStatus: "idle", // 根據暱稱取得小說的狀態
    keyWordsNovelsStatus: "idle", // 關鍵字取得小說的狀態
    addNovelStatus: "idle", // 新增小說的狀態
    delNovelStatus: "idle", // 刪除小說的狀態
    addChapterStatus: "idle", // 新增小說的狀態
    delChapterStatus: "idle", // 刪除章節的狀態
    currentNovelStatus: "idle", // 當前小說的加載狀態
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
      state.delNovelStatus = "idle";
      state.addChapterStatus = "idle";
      state.delChapterStatus = "idle";
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
    resetCurrentNovel: (state) => {
      state.currentNovel = null;
      state.currentNovelChapters = [];
      state.currentNovelStatus = "idle";
    },
    // 確保不創建新引用
    setCurrentNovel: (state, action) => {
      const { novel, chapters } = action.payload;
      if (
        novel !== state.currentNovel ||
        chapters !== state.currentNovelChapters
      ) {
        state.currentNovel = novel;
        state.currentNovelChapters = chapters;
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
      .addCase(delNovel.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
        state.delNovelStatus = "loading";
      })
      .addCase(delNovel.fulfilled, (state, action) => {
        state.delNovel = "succeeded";
        state.originalList = state.originalList.filter(
          (novel) => novel.novelId !== action.payload
        );
        state.displayList = state.originalList;
      })
      .addCase(delNovel.rejected, (state, action) => {
        state.delNovelStatus = "failed";
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
      })
      .addCase(addChapter.rejected, (state, action) => {
        state.addChapterStatus = "failed";
        console.error(
          "Failed to add chapter:",
          action.payload || action.error.message
        );
      })
      .addCase(delChapter.pending, (state) => {
        state.status = "idle";
        state.userNovelsStatus = "idle";
        state.myNovelsStatus = "idle";
        state.nickNameNovelsStatus = "idle";
        state.keyWordsNovelsStatus = "idle";
        state.delChapterStatus = "loading";
      })
      .addCase(delChapter.fulfilled, (state, action) => {
        state.delChapterStatus = "succeeded";
        state.originalList = state.originalList.filter(
          (chapter) => chapter.chapterId !== action.payload
        );
        state.displayList = state.originalList;
      })
      .addCase(delChapter.rejected, (state, action) => {
        state.delChapterStatus = "failed";
        console.error(
          "Failed to add chapter:",
          action.payload || action.error.message
        );
      })
      .addCase(getNovelByNovelId.pending, (state) => {
        state.currentNovelStatus = "loading";
      })
      .addCase(getNovelByNovelId.fulfilled, (state, action) => {
        state.currentNovelStatus = "succeeded";
        state.currentNovel = action.payload.novel;
        state.currentNovelChapters = action.payload.chapters;
      })
      .addCase(getNovelByNovelId.rejected, (state) => {
        state.currentNovelStatus = "failed";
      });
  },
});

export const {
  updateLikeStatus,
  resetNovelState,
  sortNovels,
  resetCurrentNovel,
} = novelSlice.actions;

export const selectDisplayList = (state) => state.novels.displayList;
export const selectOriginalList = (state) => state.novels.originalList;
export const selectCurrentNovel = (state) => state.novels.currentNovel;
export const selectCurrentNovelChapters = (state) =>
  state.novels.currentNovelChapters;

/*export const selectCurrentNovelStatus = (state) =>
  state.novels.currentNovelStatus;*/

export default novelSlice.reducer;
