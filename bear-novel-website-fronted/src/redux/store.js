import { configureStore } from "@reduxjs/toolkit";
import likeReducer from "./slices/likeSlice";

const store = configureStore({
  reducer: {
    // 指定 reducer, 用於處理 state 中不同部分的狀態
    likes: likeReducer, // 負責管理點讚相關的狀態
  },
});

// 將創建好的 store 匯出, 以便在應用中使用
export default store;
